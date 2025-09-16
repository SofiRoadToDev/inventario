const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authenticate = require('../middleware/authenticate');
const { roleIdValidation, roleBodyValidation } = require('../validators/roleValidator');

router.use(authenticate);

router.get('/', roleController.getAllRoles);
router.get('/:id', roleIdValidation, roleController.getRoleById);
router.post('/', roleBodyValidation, roleController.createRole);
router.put('/:id', roleIdValidation, roleBodyValidation, roleController.updateRole);
router.delete('/:id', roleIdValidation, roleController.deleteRole);

module.exports = router;