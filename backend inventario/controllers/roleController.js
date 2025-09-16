const { Role, Agent } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

exports.getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll();
  res.json(roles);
});

exports.getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id, {
    include: [{ model: Agent, as: 'agents' }],
  });

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  res.json(role);
});

exports.createRole = asyncHandler(async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
});

exports.updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  await role.update(req.body);
  res.json(role);
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  const agentsCount = await Agent.count({ where: { roleId: id } });
  if (agentsCount > 0) {
    throw new BadRequestError('No se puede eliminar un rol con agentes asignados');
  }

  await role.destroy();
  res.status(200).json({ message: 'Rol eliminado exitosamente' });
});