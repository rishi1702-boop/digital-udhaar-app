const express = require('express');
const router = express.Router();
const { handleVoiceParsing } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/parse', protect, handleVoiceParsing);

module.exports = router;
