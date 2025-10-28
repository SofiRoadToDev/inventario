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

const agentBodyValidation = [
  body('name', 'El nombre es requerido').not().isEmpty().trim().escape(),
  body('lastname', 'El apellido es requerido').not().isEmpty().trim().escape(),
  body('dni', 'El DNI debe ser un string').optional().isString().trim().escape(),
  body('roleId', 'El rol es requerido').not().isEmpty(),
  body('roleId', 'El ID del rol debe ser un número entero').isInt(),
  handleValidationErrors,
];

const agentUpdateValidation = [
  body('name').optional().not().isEmpty().withMessage('El nombre no puede estar vacío').trim().escape(),
  body('lastname').optional().not().isEmpty().withMessage('El apellido no puede estar vacío').trim().escape(),
  body('dni').optional().isString().trim().escape(),
  body('roleId').optional().isInt().withMessage('El ID del rol debe ser un número entero'),
  handleValidationErrors,
];

const agentIdValidation = [
  param('id', 'El ID debe ser un número entero').isInt(),
  handleValidationErrors,
];

module.exports = {
  agentBodyValidation,
  agentUpdateValidation,
  agentIdValidation,
};
