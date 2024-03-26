const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/\d{10}/, 'Please fill a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});


const User = mongoose.model('User', userSchema);

module.exports = User;
