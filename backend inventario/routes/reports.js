const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/assets-by-agent', reportController.getAssetsByAgent);

module.exports = router;