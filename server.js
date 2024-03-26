const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./connect/database');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Message = require('./models/Message'); // Make sure the path is correct

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store mapping of users to socket IDs
const userSocketMap = {};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use(errorHandler);

io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    userSocketMap[socket.userId] = socket.id;
    next();
  } catch (error) {
    console.error(error);
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  userSocketMap[socket.userId] = socket.id;

  socket.on('send_private_message', async ({ sender, receiver, text }) => {
    try {
      // Save message to database
      const message = await Message.create({ sender, receiver, text });

      const receiverSocketId = userSocketMap[receiver];
      if (receiverSocketId) {
        // Send message to receiver if they are connected
        io.to(receiverSocketId).emit('receive_private_message', message);
      }
    } catch (error) {
      console.error(`Failed to send message: ${error}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    // Remove user from userSocketMap
    delete userSocketMap[socket.userId];
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server listening on port ${port}`));
