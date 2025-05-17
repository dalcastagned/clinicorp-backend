const { db } = require('../config/firebase')
const os = require('os')
const { v4: uuidv4 } = require('uuid')

const TASKS_COLLECTION = 'tasks'

async function createTasks(tasksData) {
  const computerName = os.hostname()
  const batch = db.batch()
  const savedTasks = []

  tasksData.forEach(task => {
    const taskId = uuidv4()
    const taskDocRef = db.collection(TASKS_COLLECTION).doc(taskId)

    const newTask = {
      id: taskId,
      description: task.description,
      responsable: task.responsable,
      status: task.status,
      computer: computerName,
      createdAt: new Date().toISOString(),
    }
    batch.set(taskDocRef, newTask)
    savedTasks.push(newTask)
  })

  await batch.commit()

  return savedTasks
}

async function getAllTasks() {
  const snapshot = await db.collection(TASKS_COLLECTION).orderBy('createdAt', 'desc').get()
  if (snapshot.empty) {
    return []
  }
  const tasks = []
  snapshot.forEach(doc => {
    const { createdAt, ...taskData } = doc.data()
    tasks.push({ id: doc.id, ...taskData })
  })
  return tasks
}

module.exports = {
  createTasks,
  getAllTasks,
}
