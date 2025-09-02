const { Agent, Asset } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

exports.getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.findAll();
  res.json(agents);
});

exports.getAgentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await Agent.findByPk(id, {
    include: [{ model: Asset, as: 'assets' }],
  });

  if (!agent) {
    throw new NotFoundError('Agente no encontrado');
  }

  res.json(agent);
});

exports.createAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.create(req.body);
  res.status(201).json(agent);
});

exports.updateAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const agent = await Agent.findByPk(id);
  if (!agent) {
    throw new NotFoundError('Agente no encontrado');
  }

  await agent.update(req.body);
  res.json(agent);
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
