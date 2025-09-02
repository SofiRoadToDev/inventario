const Joi = require('joi');
const { Nomenclature, Asset } = require('../models');

const nomenclatureSchema = Joi.object({
  code: Joi.string().required(),
  description: Joi.string().optional(),
  type: Joi.string().required()
});

exports.getAllNomenclatures = async (req, res) => {
  try {
    const nomenclatures = await Nomenclature.findAll();
    res.json(nomenclatures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNomenclatureById = async (req, res) => {
  try {
    const { id } = req.params;
    const nomenclature = await Nomenclature.findByPk(id, {
      include: [{
        model: Asset,
        as: 'assets'
      }]
    });

    if (!nomenclature) {
      return res.status(404).json({ error: 'Nomenclature not found' });
    }

    res.json(nomenclature);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNomenclature = async (req, res) => {
  try {
    const { error, value } = nomenclatureSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const nomenclature = await Nomenclature.create(value);
    res.status(201).json(nomenclature);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNomenclature = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = nomenclatureSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const nomenclature = await Nomenclature.findByPk(id);
    if (!nomenclature) {
      return res.status(404).json({ error: 'Nomenclature not found' });
    }

    await nomenclature.update(value);
    res.json(nomenclature);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNomenclature = async (req, res) => {
  try {
    const { id } = req.params;
    const nomenclature = await Nomenclature.findByPk(id);
    
    if (!nomenclature) {
      return res.status(404).json({ error: 'Nomenclature not found' });
    }
    
    // Verificar si hay activos asociados a esta nomenclatura
    const assetsCount = await Asset.count({ where: { nomenclatureId: id } });
    if (assetsCount > 0) {
      return res.status(400).json({ error: 'Cannot delete nomenclature with assigned assets' });
    }

    await nomenclature.destroy();
    res.json({ message: 'Nomenclature deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};