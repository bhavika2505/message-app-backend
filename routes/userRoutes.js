const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], userController.registerUser);


router.post('/login', userController.loginUser);
router.get('/profile', protect, userController.getCurrentUser); 
router.get('/usernames',protect, userController.getUserNames);
router.get('/currentuser', protect, userController.getCurrentUser);
router.get('/chat-users', protect, userController.getChatUsers);


module.exports = router;
