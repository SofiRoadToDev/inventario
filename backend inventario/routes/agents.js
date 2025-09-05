const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { 
  agentBodyValidation, 
  agentUpdateValidation, 
  agentIdValidation 
} = require('../validators/agentValidator');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.route('/')
  .get(agentController.getAllAgents)
  .post(agentBodyValidation, agentController.createAgent);

router.route('/:id')
  .get(agentIdValidation, agentController.getAgentById)
  .put(agentIdValidation, agentUpdateValidation, agentController.updateAgent)
  .delete(agentIdValidation, agentController.deleteAgent);

module.exports = router;