const { Location, Asset } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

exports.getAllLocations = asyncHandler(async (req, res) => {
  const locations = await Location.findAll();
  res.json(locations);
});

exports.getLocationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id, {
    include: [{ model: Asset, as: 'assets' }],
  });

  if (!location) {
    throw new NotFoundError('Ubicación no encontrada');
  }

  res.json(location);
});

exports.createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json(location);
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id);

  if (!location) {
    throw new NotFoundError('Ubicación no encontrada');
  }

  await location.update(req.body);
  res.json(location);
});

exports.deleteLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id);

  if (!location) {
    throw new NotFoundError('Ubicación no encontrada');
  }

  const assetsCount = await Asset.count({ where: { locationId: id } });
  if (assetsCount > 0) {
    throw new BadRequestError('No se puede eliminar una ubicación con activos asignados');
  }

  await location.destroy();
  res.status(200).json({ message: 'Ubicación eliminada exitosamente' });
});
