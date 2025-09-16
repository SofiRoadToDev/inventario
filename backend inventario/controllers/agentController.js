const { Agent, Asset, Role } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

exports.getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.findAll({
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
  res.json(agents);
});

exports.getAgentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await Agent.findByPk(id, {
    include: [
      { model: Asset, as: 'assets' },
      { model: Role, as: 'role', attributes: ['id', 'name'] },
    ],
  });

  if (!agent) {
    throw new NotFoundError('Agente no encontrado');
  }

  res.json(agent);
});

exports.createAgent = asyncHandler(async (req, res) => {
  console.log('request', req.body)
  const { roleId } = req.body;

  // Verificar que el rol exista antes de crear el agente
  if (roleId) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new BadRequestError('El rol especificado no existe');
    }
  }

  const agent = await Agent.create(req.body);

  // Devolver el agente recién creado con la información de su rol
  const newAgent = await Agent.findByPk(agent.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });

  res.status(201).json(newAgent);
});

exports.updateAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  // Si se está actualizando el rol, verificar que el nuevo rol exista
  if (roleId) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new BadRequestError('El rol especificado no existe');
    }
  }

  const agent = await Agent.findByPk(id);
  if (!agent) {
    throw new NotFoundError('Agente no encontrado');
  }

  await agent.update(req.body);

  // Devolver el agente actualizado con la información de su rol
  const updatedAgent = await Agent.findByPk(id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
  res.json(updatedAgent);
});

exports.deleteAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await Agent.findByPk(id);

  if (!agent) {
    throw new NotFoundError('Agente no encontrado');
  }

  const assetsCount = await Asset.count({ where: { agentId: id } });
  if (assetsCount > 0) {
    throw new BadRequestError('No se puede eliminar un agente con activos asignados');
  }

  await agent.destroy();
  res.status(200).json({ message: 'Agente eliminado exitosamente' });
});
