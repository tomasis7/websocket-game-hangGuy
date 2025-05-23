// This is the main entry point for the websocket server using Socket.IO.
// It sets up event listeners for client connections and handles the 'like' event.
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";

// Create a new Socket.IO server instance with typed events and socket data
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();

let guestIndex = 1; // Used to assign unique guest names to each connection

// Listen for new client connections
io.on("connection", (socket) => {
  console.log(`A user connected ` + socket.id);
  // Assign a unique guest name to the connected socket
  socket.data.name = "Guest" + guestIndex++;
  // Listen for 'like' events from the client and broadcast to all clients
  socket.on("like", () => io.emit("like"));
});

// Start the server on port 3000
io.listen(3000);
console.log("Websocket server is running on port 3000");
