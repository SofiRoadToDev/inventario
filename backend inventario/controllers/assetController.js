const Joi = require('joi');
const { Asset, Agent } = require('../models');
const { Op } = require('sequelize');

const assetSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  serialNumber: Joi.string().required(),
  value: Joi.number().positive().required(),
  purchaseDate: Joi.date().required(),
  status: Joi.string().valid('active', 'in_repair', 'decommissioned').required(),
  imageUrl: Joi.string().optional(),
  agentId: Joi.number().integer().required()
});

exports.getAllAssets = async (req, res) => {
  try {
    const { status, agentId } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    const assets = await Asset.findAll({
      where,
      include: [{
        model: Agent,
        as: 'agent',
        attributes: ['id', 'name', 'department']
      }]
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id, {
      include: [{
        model: Agent,
        as: 'agent',
        attributes: ['id', 'name', 'department']
      }]
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const { error } = assetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { agentId } = req.body;
    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const asset = await Asset.create(req.body);
    const assetWithAgent = await Asset.findByPk(asset.id, {
      include: [{
        model: Agent,
        as: 'agent',
        attributes: ['id', 'name', 'department']
      }]
    });

    res.status(201).json(assetWithAgent);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = assetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const { agentId } = req.body;
    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await asset.update(req.body);
    const updatedAsset = await Asset.findByPk(id, {
      include: [{
        model: Agent,
        as: 'agent',
        attributes: ['id', 'name', 'department']
      }]
    });

    res.json(updatedAsset);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await asset.destroy();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};