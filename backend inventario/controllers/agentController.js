const Joi = require('joi');
const { Agent, Asset } = require('../models');

const agentSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.string().required()
});

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findByPk(id, {
      include: [{
        model: Asset,
        as: 'assets'
      }]
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { error } = agentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const agent = await Agent.create(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = agentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await agent.update(req.body);
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findByPk(id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const assetsCount = await Asset.count({ where: { agentId: id } });
    if (assetsCount > 0) {
      return res.status(400).json({ error: 'Cannot delete agent with assigned assets' });
    }

    await agent.destroy();
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};