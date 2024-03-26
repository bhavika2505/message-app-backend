const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');

const sendMessage = asyncHandler(async (req, res) => {
    const { sender, receiver, text } = req.body;

    const message = await Message.create({
        sender,
        receiver,
        text
    });

    if (message) {
        res.status(201).json(message);
    } else {
        res.status(400);
        throw new Error('Message could not be sent');
    }
});

const getMessages = asyncHandler(async (req, res) => {
    const { userId, contactId } = req.params;
  
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    }).sort('createdAt');
  
    res.status(200).json(messages);
  });

module.exports = {
    getMessages,
    sendMessage
};
