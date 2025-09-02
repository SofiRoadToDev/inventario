const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');
const { categoryIdValidation, categoryBodyValidation } = require('../validators/categoryValidator');

router.use(authenticate);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryIdValidation, categoryController.getCategoryById);
router.post('/', categoryBodyValidation, categoryController.createCategory);
router.put('/:id', categoryIdValidation, categoryBodyValidation, categoryController.updateCategory);
router.delete('/:id', categoryIdValidation, categoryController.deleteCategory);

module.exports = router;
