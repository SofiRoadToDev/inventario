const { Agent, Asset, Role } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getAssetsByAgent = asyncHandler(async (req, res) => {
  const agents = await Agent.findAll({
    include: [
      {
        model: Asset,
        as: 'assets',
        attributes: ['id', 'name', 'serialNumber', 'status', 'value'],
      },
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
  });

  res.json(agents);
});
