// This file initializes the websocket connection for the client using socket.io-client.
// It imports the types for type safety, ensuring that only valid events are sent/received.
// The socket instance is exported for use throughout the client app.
import { io, Socket } from "socket.io-client";

// Create a typed socket.io client instance connecting to the main game server on port 3001
// Enhanced with robust reconnection settings for better connection handling
export const socket: Socket<any, any> = io("http://localhost:3001", {
  transports: ["websocket", "polling"], // Fallback to polling if websocket fails
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10, // Increased from 5 to 10
  reconnectionDelay: 1000, // Start with 1 second delay
  reconnectionDelayMax: 5000, // Max delay of 5 seconds
  randomizationFactor: 0.5, // Add randomization to prevent thundering herd
  timeout: 20000, // 20 second connection timeout
  forceNew: false, // Reuse existing connection if possible
});
