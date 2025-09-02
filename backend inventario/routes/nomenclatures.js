const express = require('express');
const router = express.Router();
const nomenclatureController = require('../controllers/nomenclatureController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', nomenclatureController.getAllNomenclatures);
router.get('/:id', nomenclatureController.getNomenclatureById);
router.post('/', nomenclatureController.createNomenclature);
router.put('/:id', nomenclatureController.updateNomenclature);
router.delete('/:id', nomenclatureController.deleteNomenclature);

module.exports = router;