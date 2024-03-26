const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware
const router = express.Router();

// Send a new message
router.post('/', protect, sendMessage);

router.get('/conversation/:userId/:contactId', protect, getMessages);

module.exports = router;
