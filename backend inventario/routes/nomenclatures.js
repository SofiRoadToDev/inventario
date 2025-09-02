const express = require('express');
const router = express.Router();
const nomenclatureController = require('../controllers/nomenclatureController');
const authenticate = require('../middleware/authenticate');
const { nomenclatureIdValidation, nomenclatureBodyValidation } = require('../validators/nomenclatureValidator');

router.use(authenticate);

router.get('/', nomenclatureController.getAllNomenclatures);
router.get('/:id', nomenclatureIdValidation, nomenclatureController.getNomenclatureById);
router.post('/', nomenclatureBodyValidation, nomenclatureController.createNomenclature);
router.put('/:id', nomenclatureIdValidation, nomenclatureBodyValidation, nomenclatureController.updateNomenclature);
router.delete('/:id', nomenclatureIdValidation, nomenclatureController.deleteNomenclature);

module.exports = router;
