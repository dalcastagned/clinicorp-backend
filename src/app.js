require('dotenv').config()
const express = require('express')
const cors = require('cors')
const allRoutes = require('./routes')
const errorHandler = require('./middlewares/errorHandler')
const { StatusCodes } = require('http-status-codes')

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', allRoutes)

app.get('/', (_, res) => {
  res.status(StatusCodes.OK).json({ message: 'Servidor de Tarefas no ar!' })
})

app.use((_, __, next) => {
  const error = new Error('Rota não encontrada.')
  error.statusCode = StatusCodes.NOT_FOUND
  next(error)
})

app.use(errorHandler)

module.exports = app
