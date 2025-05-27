import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "../../shared/config";
import { container } from "./services/container";
import { SocketOrchestrator } from "./controllers";

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.client.url,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: config.client.url,
    credentials: true,
  })
);
app.use(express.json());

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Hangman Game Server",
    version: "2.0.0",
    environment: config.environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: "healthy",
  });
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    environment: config.environment,
    features: {
      chat: true,
      multiplayer: true,
      rooms: true,
    },
  });
});

async function startServer() {
  try {
    console.log("🚀 Starting Hangman Game Server...");

    // Initialize dependency injection container
    container.initialize(io);

    // Initialize socket orchestrator
    const orchestrator = new SocketOrchestrator(io);
    await orchestrator.initialize();

    // Start server
    const PORT = config.server.port;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.environment}`);
      console.log(`🔗 Client URL: ${config.client.url}`);
      console.log(`📝 Logs level: ${config.server.logLevel}`);
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      console.log("\n🔄 Graceful shutdown initiated...");
      await orchestrator.shutdown();
      server.close(() => {
        console.log("✅ Server shut down successfully");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("\n🔄 Graceful shutdown initiated...");
      await orchestrator.shutdown();
      server.close(() => {
        console.log("✅ Server shut down successfully");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default io;
