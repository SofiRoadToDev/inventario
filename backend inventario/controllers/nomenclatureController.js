const { Nomenclature, Asset } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

exports.getAllNomenclatures = asyncHandler(async (req, res) => {
  const nomenclatures = await Nomenclature.findAll();
  res.json(nomenclatures);
});

exports.getNomenclatureById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nomenclature = await Nomenclature.findByPk(id, {
    include: [{ model: Asset, as: 'assets' }],
  });

  if (!nomenclature) {
    throw new NotFoundError('Nomenclatura no encontrada');
  }

  res.json(nomenclature);
});

exports.createNomenclature = asyncHandler(async (req, res) => {
  const nomenclature = await Nomenclature.create(req.body);
  res.status(201).json(nomenclature);
});

exports.updateNomenclature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nomenclature = await Nomenclature.findByPk(id);

  if (!nomenclature) {
    throw new NotFoundError('Nomenclatura no encontrada');
  }

  await nomenclature.update(req.body);
  res.json(nomenclature);
});

exports.deleteNomenclature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nomenclature = await Nomenclature.findByPk(id);

  if (!nomenclature) {
    throw new NotFoundError('Nomenclatura no encontrada');
  }

  const assetsCount = await Asset.count({ where: { nomenclatureId: id } });
  if (assetsCount > 0) {
    throw new BadRequestError('No se puede eliminar una nomenclatura con activos asignados');
  }

  await nomenclature.destroy();
  res.status(200).json({ message: 'Nomenclatura eliminada exitosamente' });
});
