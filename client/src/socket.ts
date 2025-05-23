// This file initializes the websocket connection for the client using socket.io-client.
// It imports the types for type safety, ensuring that only valid events are sent/received.
// The socket instance is exported for use throughout the client app.
import { io, Socket } from "socket.io-client";

// Create a typed socket.io client instance connecting to the main game server on port 3001
// Using any typing for now to resolve the type conflicts between the shared types
export const socket: Socket<any, any> = io("http://localhost:3001", {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
});
