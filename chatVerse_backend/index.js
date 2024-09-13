const express = require("express")
const connectdb = require("./mongoDB/connectdb.js")
const http = require("http")
const cors = require("cors")
const socketIO = require("socket.io")
const dotenv = require("dotenv").config()
const userRoutes = require("./routes/user.route.js");
const messageRoutes = require("./routes/message.route.js");
const chatRoutes = require("./routes/chat.route.js");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser());


const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIO(server);

app.use("/api/v1/auth/",userRoutes);
app.use('/api/v1/chat/', chatRoutes);
app.use('/api/v1/message/', messageRoutes);
mongoose.set('strictQuery', false);


(async () => {
    try {
        await connectdb(); // Wait for the database to connect
        server.listen(PORT, () => {
            console.log(`App running on PORT: ${PORT}`);
        });
    } catch (error) {
        console.log("Error connecting to the database:", error);
    }
})();

// Socket.IO connection handler
io.on('connection', (socket) => {
    socket.on('new-user-joined', (userData) => {
        socket.join(userData.id);
        socket.emit('user-joined');
    });

    socket.on('join-room', roomId => {
        socket.join(roomId);
    });

    socket.on('typing', (roomId) => socket.in(roomId).emit('typing'));
    socket.on('stop typing', (roomId) => socket.in(roomId).emit('stop typing'));

  
    // Listening for a message event
    socket.on('sentMessage', (messageData) => {
      // Emit the message to all connected clients
      socket.to(messageData.roomId).emit('receivedMessage', messageData);
    });
  
    // Disconnect event
    // socket.on('disconnect', (user) => {
        // socket.to(user.roomId).emit('user-disconnected)
    //   console.log(`${user} disconnected`);
    // });
  });