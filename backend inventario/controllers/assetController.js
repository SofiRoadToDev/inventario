const { Asset, Agent, Location, Category, Nomenclature } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

// Helper para verificar la existencia de entidades relacionadas
const checkRelatedEntities = async (body) => {
  const { agentId, locationId, categoryId, nomenclatureId } = body;
  if (agentId && !(await Agent.findByPk(agentId))) throw new BadRequestError('El agente especificado no existe');
  if (locationId && !(await Location.findByPk(locationId))) throw new BadRequestError('La ubicación especificada no existe');
  if (categoryId && !(await Category.findByPk(categoryId))) throw new BadRequestError('La categoría especificada no existe');
  if (nomenclatureId && !(await Nomenclature.findByPk(nomenclatureId))) throw new BadRequestError('La nomenclatura especificada no existe');
};

exports.getAllAssets = asyncHandler(async (req, res) => {
  const { status, agentId } = req.query;
  const where = {};

  if (status) where.status = status;
  if (agentId) where.agentId = agentId;

  const assets = await Asset.findAll({
    where,
    include: [
      { model: Agent, as: 'agent', attributes: ['id', 'name', 'department'] },
      { model: Location, as: 'location', attributes: ['id', 'name'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Nomenclature, as: 'nomenclature', attributes: ['id', 'code'] },
    ],
  });

  res.json(assets);
});

exports.getAssetById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const asset = await Asset.findByPk(id, {
    include: [
        { model: Agent, as: 'agent', attributes: ['id', 'name', 'department'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Nomenclature, as: 'nomenclature', attributes: ['id', 'code'] },
    ],
  });

  if (!asset) {
    throw new NotFoundError('Activo no encontrado');
  }

  res.json(asset);
});

exports.createAsset = asyncHandler(async (req, res) => {
  await checkRelatedEntities(req.body);
  
  try {
    const asset = await Asset.create(req.body);
    const newAsset = await Asset.findByPk(asset.id, {
        include: [
            { model: Agent, as: 'agent', attributes: ['id', 'name', 'department'] },
            { model: Location, as: 'location', attributes: ['id', 'name'] },
            { model: Category, as: 'category', attributes: ['id', 'name'] },
            { model: Nomenclature, as: 'nomenclature', attributes: ['id', 'code'] },
        ],
    });
    res.status(201).json(newAsset);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new BadRequestError('El número de serie ya existe');
    }
    throw error;
  }
});

exports.updateAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const asset = await Asset.findByPk(id);

  if (!asset) {
    throw new NotFoundError('Activo no encontrado');
  }

  await checkRelatedEntities(req.body);

  try {
    await asset.update(req.body);
    const updatedAsset = await Asset.findByPk(id, {
        include: [
            { model: Agent, as: 'agent', attributes: ['id', 'name', 'department'] },
            { model: Location, as: 'location', attributes: ['id', 'name'] },
            { model: Category, as: 'category', attributes: ['id', 'name'] },
            { model: Nomenclature, as: 'nomenclature', attributes: ['id', 'code'] },
        ],
    });
    res.json(updatedAsset);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new BadRequestError('El número de serie ya existe');
    }
    throw error;
  }
});

exports.deleteAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const asset = await Asset.findByPk(id);

  if (!asset) {
    throw new NotFoundError('Activo no encontrado');
  }

  await asset.destroy();
  res.status(200).json({ message: 'Activo eliminado exitosamente' });
});
