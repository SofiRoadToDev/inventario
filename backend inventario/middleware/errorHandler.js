const { ApiError } = require('../utils/customErrors');

const errorHandler = (err, req, res, next) => {
  // Si el error es una instancia de nuestra clase ApiError, usamos su statusCode y mensaje
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Para cualquier otro tipo de error, devolvemos un 500 Internal Server Error
  // Es importante loggear el error para depuración en un entorno real
  console.error(err);

  return res.status(500).json({
    error: 'Ocurrió un error inesperado en el servidor.',
  });
};

module.exports = errorHandler;
