const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { UnauthorizedError, BadRequestError } = require('../utils/customErrors');

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('El email ya está en uso');
  }

  await User.create({ name, email, password });

  res.status(201).json({ message: 'Usuario creado exitosamente' });
});
