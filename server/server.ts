// This is a simple redirect server - use src/index.ts for the full Hang Guy game
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../shared/types";

// Create a new Socket.IO server instance with typed events and socket data
const io = new Server<ClientToServerEvents, ServerToClientEvents>({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let guestIndex = 1;

// Listen for new client connections
io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // Assign a unique guest name to the connected socket
  socket.data.name = "Guest" + guestIndex++;

  // Inform user about the main game server
  socket.emit(
    "notification",
    "Please connect to the main Hang Guy game server on port 3001"
  );

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Start the server on port 3000
io.listen(3000);
console.log("🚀 Simple redirection server running on port 3000");
console.log("⚠️  For the full Hang Guy game, use: npm run dev");
console.log("⚠️  The main game server is at: server/src/index.ts (port 3001)");
