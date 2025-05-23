const express = require('express')
const taskController = require('../controllers/taskController')
const { validateInsertTasks } = require('../middlewares/validator')

const router = express.Router()

router.post('/insert-tasks', validateInsertTasks, taskController.handleCreateTasks)
router.get('/get-tasks', taskController.handleGetAllTasks)

module.exports = router
