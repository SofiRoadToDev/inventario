const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authenticate = require('../middleware/authenticate');
const { locationIdValidation, locationBodyValidation } = require('../validators/locationValidator');

router.use(authenticate);

router.get('/', locationController.getAllLocations);
router.get('/:id', locationIdValidation, locationController.getLocationById);
router.post('/', locationBodyValidation, locationController.createLocation);
router.put('/:id', locationIdValidation, locationBodyValidation, locationController.updateLocation);
router.delete('/:id', locationIdValidation, locationController.deleteLocation);

module.exports = router;
