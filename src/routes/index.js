const express = require('express');
const { targetFindingRules, validate } = require('../middleware/validate');
const targetController = require('../controllers/targetController');

const router = express.Router();

// Health check endpoint
router.get('/', targetController.healthCheck);

// Main API endpoint for finding targets
router.post('/api/find-targets', targetFindingRules, validate, targetController.findTargets);

module.exports = router;
