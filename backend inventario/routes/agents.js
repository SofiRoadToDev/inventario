const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authenticate = require('../middleware/authenticate');
const { agentValidation, agentIdValidation } = require('../validators/agentValidator');

router.use(authenticate);

router.get('/', agentController.getAllAgents);
router.get('/:id', agentIdValidation, agentController.getAgentById);
router.post('/', agentValidation, agentController.createAgent);
router.put('/:id', agentIdValidation, agentValidation, agentController.updateAgent);
router.delete('/:id', agentIdValidation, agentController.deleteAgent);

module.exports = router;
