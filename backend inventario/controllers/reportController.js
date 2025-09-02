const { Agent, Asset } = require('../models');

exports.getAssetsByAgent = async (req, res) => {
  try {
    const agents = await Agent.findAll({
      include: [{
        model: Asset,
        as: 'assets',
        attributes: ['id', 'name', 'serialNumber', 'status', 'value']
      }]
    });

    const report = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      department: agent.department,
      assets: agent.assets
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};