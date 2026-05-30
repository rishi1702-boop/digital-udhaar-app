const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', handleChat);

module.exports = router;
