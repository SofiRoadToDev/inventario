const { ForbiddenError } = require('../utils/customErrors');

/**
 * Middleware para verificar si el usuario tiene el rol requerido
 * @param {string|string[]} roles - Rol o roles permitidos
 * @returns {Function} Middleware
 */
const checkRole = (roles) => {
  // Convertir a array si es un string
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Verificar que el usuario tenga el rol requerido
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('No tienes permiso para acceder a este recurso');
    }

    next();
  };
};

module.exports = checkRole;