const { body, param, validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/customErrors');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new BadRequestError(errorMessages.join(', '));
  }
  next();
};

const agentValidation = [
  body('name', 'El nombre es requerido').not().isEmpty().trim().escape(),
  body('department', 'El departamento es requerido').not().isEmpty().trim().escape(),
  handleValidationErrors,
];

const agentIdValidation = [
  param('id', 'El ID debe ser un número entero').isInt(),
  handleValidationErrors,
];

module.exports = {
  agentValidation,
  agentIdValidation,
};
