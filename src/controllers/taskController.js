const taskService = require('../services/taskService');
const { StatusCodes } = require('http-status-codes');

async function handleCreateTasks(req, res, next) {
  try {
    const tasksData = req.body;
    const createdTasks = await taskService.createTasks(tasksData);
    res.status(StatusCodes.CREATED).json(createdTasks);
  } catch (error) {
    next(error);
  }
}

async function handleGetAllTasks(_, res, next) {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(StatusCodes.OK).json(tasks);
  } catch (error) {
    next(error); 
  }
}

module.exports = {
  handleCreateTasks,
  handleGetAllTasks,
};