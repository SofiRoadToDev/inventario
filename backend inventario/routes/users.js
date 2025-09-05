const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticate = require('../middleware/authenticate');
const checkRole = require('../middleware/checkRole');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

router.use(authenticate);

// Obtener todos los usuarios (solo admin)
router.get('/', checkRole(['admin']), asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
  });
  res.json(users);
}));

// Obtener un usuario por ID (solo admin)
router.get('/:id', checkRole(['admin']), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
  });
  
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  
  res.json(user);
}));

// Actualizar rol de usuario (solo admin)
router.patch('/:id/role', checkRole(['admin']), asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['admin', 'user'].includes(role)) {
    throw new BadRequestError('Rol inválido. Debe ser "admin" o "user"');
  }
  
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  
  user.role = role;
  await user.save();
  
  res.json({
    message: 'Rol actualizado correctamente',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

module.exports = router;