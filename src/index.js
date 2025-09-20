const express = require('express');
const app = express();
const cors = require('cors');
const socket=require('socket.io')
const cookieParser = require("cookie-parser");
const router = require('../route/user');
const http=require('http');
const crypto=require('crypto')
const { connectDB } = require('./database');
const {chatmodel}=require('../models/chat')


function hashkey(userId,targetUserId){
 return  crypto.createHash("sha256").update([userId,targetUserId].sort().join("_")).digest("hex")
}
// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true // use this if you're working with cookies or sessions
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(router);
const server = http.createServer(app)
const io= socket(server,{
    cors:{
        origin:"http://localhost:4200"
    }
})
io.on("connection",(socket)=>{
    socket.on('joinchat',({userId,targetUserId})=>{
        const room =hashkey(userId,targetUserId)
        socket.join(room)

    });
   socket.on('sendmsg', async ({ firstName, userId, targetUserId, text,imgUrl }) => {
  const room = hashkey(userId, targetUserId);
  try {
    let chat = await chatmodel.findOne({ participate: { $all: [userId, targetUserId] } });

    if (!chat) {
      // Create new chat if doesn't exist
      chat = await chatmodel.create({
        participate: [userId, targetUserId],
        messages: [{ senderId: userId, text }]
      });
    } else {
      // Push new message into existing chat
      chat.messages.push({ senderId: userId, text });
      await chat.save();   // ✅ persist it
    }

    // Emit to clients
    io.to(room).emit('msgrecieved', {
      firstName,
      userId,
      targetUserId,
      text,
      time: new Date(),
      imgUrl
    });
  } catch (error) {
    console.error("sendmsg error:", error);
  }
});

    socket.on('disconnect',()=>{});
})
// Start Server
server.listen(3000, (error) => {
  connectDB().then(() => {
    console.log("Database connected successfully");
  });
});
