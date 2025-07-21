import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupHangmanBroadcasters } from "./broadcastHandlers";

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Hang Guy Game Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Setup hangman game broadcasting handlers
  setupHangmanBroadcasters(io, socket);

  // Log disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Hang Guy Game ready for multiplayer action!`);
});

export default io;
