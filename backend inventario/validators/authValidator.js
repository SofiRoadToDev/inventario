const { body, validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/customErrors');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formateamos los errores para que sean más legibles
    const errorMessages = errors.array().map(err => err.msg);
    throw new BadRequestError(errorMessages.join(', '));
  }
  next();
};

const registerValidation = [
  body('name', 'El nombre es requerido').not().isEmpty().trim().escape(),
  body('email', 'Por favor, incluye un email válido').isEmail().normalizeEmail(),
  body('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 }),
  handleValidationErrors,
];

const loginValidation = [
  body('email', 'Por favor, incluye un email válido').isEmail().normalizeEmail(),
  body('password', 'La contraseña es requerida').exists(),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
};
