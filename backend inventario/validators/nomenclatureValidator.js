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

const nomenclatureIdValidation = [
  param('id', 'El ID debe ser un número entero').isInt(),
  handleValidationErrors,
];

const nomenclatureBodyValidation = [
  body('name', 'El nombre es requerido').not().isEmpty().trim().escape(),
  body('code', 'El código es requerido').not().isEmpty().trim().escape(),
  handleValidationErrors,
];

const nomenclatureUpdateValidation = [
  body('name').optional().not().isEmpty().trim().escape().withMessage('El nombre no puede estar vacío'),
  body('code').optional().not().isEmpty().trim().escape().withMessage('El código no puede estar vacío'),
  handleValidationErrors,
];

module.exports = {
  nomenclatureIdValidation,
  nomenclatureBodyValidation,
  nomenclatureUpdateValidation,
};
