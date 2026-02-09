const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const express = require("express");

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

connectDB();

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", process.env.FRONTEND_URL], // Specific origins are required when credentials are true
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"],
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10
});

// Load socket handlers ONCE (outside the connection handler)
const messageSocketHandler = require("./sockets/message.socket");
const typingSocketHandler = require("./sockets/typing.socket");
const chatSocketHandler = require("./sockets/chat.socket");

// Initialize socket handlers
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Setup socket handlers (each handler is a function that receives io and socket)
  messageSocketHandler(io, socket);
  typingSocketHandler(io, socket);
  chatSocketHandler(io, socket);

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible to our router
app.set('io', io);

server.listen(5001, () => {
  console.log("Server running on port", 5001);
  console.log("Server is running at: http://localhost:" + 5001);
});
