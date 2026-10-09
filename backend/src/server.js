const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

const http = require("http");
const express = require("express");

const app = require("./app");
const connectDB = require("./config/db");


// ==========================================
// CHECK ENVIRONMENT VARIABLES
// ==========================================

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}


// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();


// ==========================================
// STATIC FILES
// ==========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);


// ==========================================
// FRONTEND URL
// ==========================================

const frontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, "")
  : undefined;


// ==========================================
// CREATE HTTP SERVER
// ==========================================

const server = http.createServer(app);


// ==========================================
// SOCKET.IO
// ==========================================

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://chat-z.vercel.app",
      frontendUrl
    ].filter(Boolean),

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],

    credentials: true
  },

  transports: [
    "websocket",
    "polling"
  ],

  reconnectionDelay: 1000,

  reconnection: true,

  reconnectionAttempts: 10
});


// ==========================================
// SOCKET HANDLERS
// ==========================================

const messageSocketHandler =
  require("./sockets/message.socket");

const typingSocketHandler =
  require("./sockets/typing.socket");

const chatSocketHandler =
  require("./sockets/chat.socket");


// ==========================================
// SOCKET.IO CONNECTION
// ==========================================

io.on("connection", (socket) => {

  console.log(
    "New client connected:",
    socket.id
  );


  // ----------------------------------------
  // Message events
  // ----------------------------------------

  messageSocketHandler(io, socket);


  // ----------------------------------------
  // Typing events
  // ----------------------------------------

  typingSocketHandler(io, socket);


  // ----------------------------------------
  // Chat / user events
  // ----------------------------------------

  chatSocketHandler(io, socket);


  // ----------------------------------------
  // Video call
  // ----------------------------------------

  socket.on("callUser", (data) => {

    io.to(data.userToCall).emit(
      "callUser",
      {
        signal: data.signalData,
        from: data.from,
        name: data.name
      }
    );

  });


  socket.on("answerCall", (data) => {

    io.to(data.to).emit(
      "callAccepted",
      data.signal
    );

  });


  // ----------------------------------------
  // Disconnect
  // ----------------------------------------

  socket.on("disconnect", () => {

    console.log(
      "Client disconnected:",
      socket.id
    );

  });

});


// ==========================================
// MAKE SOCKET.IO AVAILABLE TO EXPRESS
// ==========================================

app.set("io", io);


// ==========================================
// START SERVER
// ==========================================

const PORT = 5001;

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    `Server is running at: http://localhost:${PORT}`
  );

});