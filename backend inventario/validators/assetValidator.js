const { body, param, query, validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/customErrors');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new BadRequestError(errorMessages.join(', '));
  }
  next();
};

const assetIdValidation = [
  param('id', 'El ID debe ser un número entero').isInt(),
  handleValidationErrors,
];

const assetQueryValidation = [
  query('status').optional().isIn(['active', 'in_repair', 'decommissioned']).withMessage('Estado no válido'),
  query('agentId').optional().isInt().withMessage('El ID del agente debe ser un número entero'),
  handleValidationErrors,
];

const assetBodyValidation = [
  body('name', 'El nombre es requerido').not().isEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('serialNumber', 'El número de serie es requerido').not().isEmpty().trim().escape(),
  body('value', 'El valor debe ser un número').isFloat({ gt: 0 }),
  body('purchaseDate', 'La fecha de compra debe ser una fecha válida').isISO8601().toDate(),
  body('status', 'Estado no válido').isIn(['active', 'in_repair', 'decommissioned']),
  body('agentId').optional({ nullable: true }).isInt().withMessage('El ID de agente debe ser un número entero'),
  body('locationId').optional({ nullable: true }).isInt().withMessage('El ID de ubicación debe ser un número entero'),
  body('categoryId').optional({ nullable: true }).isInt().withMessage('El ID de categoría debe ser un número entero'),
  body('nomenclatureId').optional({ nullable: true }).isInt().withMessage('El ID de nomenclatura debe ser un número entero'),
  handleValidationErrors,
];

const assetUpdateValidation = [
  body('name').optional().not().isEmpty().trim().escape().withMessage('El nombre no puede estar vacío'),
  body('description').optional().trim().escape(),
  body('serialNumber').optional().not().isEmpty().trim().escape().withMessage('El número de serie no puede estar vacío'),
  body('value').optional().isFloat({ gt: 0 }).withMessage('El valor debe ser un número positivo'),
  body('purchaseDate').optional().isISO8601().toDate().withMessage('La fecha de compra debe ser una fecha válida'),
  body('status').optional().isIn(['active', 'in_repair', 'decommissioned']).withMessage('Estado no válido'),
  body('agentId').optional({ nullable: true }).isInt().withMessage('El ID de agente debe ser un número entero'),
  body('locationId').optional({ nullable: true }).isInt().withMessage('El ID de ubicación debe ser un número entero'),
  body('categoryId').optional({ nullable: true }).isInt().withMessage('El ID de categoría debe ser un número entero'),
  body('nomenclatureId').optional({ nullable: true }).isInt().withMessage('El ID de nomenclatura debe ser un número entero'),
  handleValidationErrors,
];

module.exports = {
  assetIdValidation,
  assetQueryValidation,
  assetBodyValidation,
  assetUpdateValidation,
};
