// server.js
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { Server } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server using Express app
const server = http.createServer(app);

// Setup Socket.io on the server with CORS config
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Replace * with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes/controllers via app.locals
app.locals.io = io;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
