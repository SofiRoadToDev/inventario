const { Category, Asset } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id, {
    include: [{ model: Asset, as: 'assets' }],
  });

  if (!category) {
    throw new NotFoundError('Categoría no encontrada');
  }

  res.json(category);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);

  if (!category) {
    throw new NotFoundError('Categoría no encontrada');
  }

  await category.update(req.body);
  res.json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);

  if (!category) {
    throw new NotFoundError('Categoría no encontrada');
  }

  const assetsCount = await Asset.count({ where: { categoryId: id } });
  if (assetsCount > 0) {
    throw new BadRequestError('No se puede eliminar una categoría con activos asignados');
  }

  await category.destroy();
  res.status(200).json({ message: 'Categoría eliminada exitosamente' });
});
