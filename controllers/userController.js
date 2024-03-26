const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');



// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email,phone, password } = req.body;

    if (!name || !email || !password || !phone) {
        res.status(400);
        throw new Error('All fields are mandatory');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone:user.phone,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// Authenticate a user and get token
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});


const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
});


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};


const getUserNames = async (req, res) => {
    try {
        const users = await User.find({}, 'name id'); // Fetch both 'name' and 'id' fields of all users
        const userData = users.map(user => ({ id: user.id, name: user.name })); // Map each user to an object containing id and name
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getChatUsers = asyncHandler(async (req, res) => {
    try {
      const users = await User.find({}).select('_id name');
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    getUserNames,
    getChatUsers
};
