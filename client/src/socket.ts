// This file initializes the websocket connection for the client using socket.io-client.
// It imports the types for type safety, ensuring that only valid events are sent/received.
// The socket instance is exported for use throughout the client app.
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../shared/types";

// Create a typed socket.io client instance
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
