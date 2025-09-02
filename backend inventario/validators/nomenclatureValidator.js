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
  body('code', 'El código es requerido').not().isEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  handleValidationErrors,
];

module.exports = {
  nomenclatureIdValidation,
  nomenclatureBodyValidation,
};
