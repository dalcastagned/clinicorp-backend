const { StatusCodes } = require('http-status-codes')

function errorHandler(err, _, res, __) {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  const details = err.message || 'Ocorreu um erro interno no servidor.'

  res.status(statusCode).json({
    message: 'error',
    details,
  })
}

module.exports = errorHandler
