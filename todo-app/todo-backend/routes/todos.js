const express = require('express');
const { Todo } = require('../mongo')
const { getAsync, setAsync } = require('../redis');
const router = express.Router();

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })


  const currentCount = await getAsync('added_todos');
  const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
  await setAsync('added_todos', newCount);

  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});


//jobba rhär
/* GET todo. */
singleRouter.get('/:id', async (req, res) => {
const todo = await Todo.findById(req.params.id);
  if (todo) {
    res.json(todo);
  } else {
    res.status(404).end();
  }
});

/* PUT todo. */
singleRouter.put('/:id', async (req, res) => {
  const { text, done } = req.body;
  const updatedTodo = await Todo.findByIdAndUpdate(
    req.params.id,
    { text, done },
    { new: true }
  );
  res.send(updatedTodo);
});

router.use('/:id', findByIdMiddleware, singleRouter)



module.exports = router;
