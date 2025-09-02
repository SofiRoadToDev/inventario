const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authenticate = require('../middleware/authenticate');
const {
  assetIdValidation,
  assetQueryValidation,
  assetBodyValidation,
  assetUpdateValidation,
} = require('../validators/assetValidator');

router.use(authenticate);

router.get('/', assetQueryValidation, assetController.getAllAssets);
router.get('/:id', assetIdValidation, assetController.getAssetById);
router.post('/', assetBodyValidation, assetController.createAsset);
router.put('/:id', assetIdValidation, assetUpdateValidation, assetController.updateAsset);
router.delete('/:id', assetIdValidation, assetController.deleteAsset);

module.exports = router;
