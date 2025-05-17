const { StatusCodes } = require('http-status-codes');

function errorHandler(err, _, res) {
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error('-----------------------------------');
    console.error('Ocorreu um erro:');
    console.error('Mensagem:', err.message);
    console.error('Status Code:', err.statusCode);
    console.error('Stack Trace:', err.stack);
    console.error('-----------------------------------');
  }


  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
}

module.exports = errorHandler;