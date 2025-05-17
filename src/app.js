require('dotenv').config(); 
const express = require('express');
const { StatusCodes } = require('http-status-codes');

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.status(StatusCodes.OK).json({ message: 'Servidor de Tarefas no ar!' });
});

app.use((_, __, next) => {
  const error = new Error('Rota não encontrada.');
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
});

module.exports = app;