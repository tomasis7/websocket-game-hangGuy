// This file defines TypeScript interfaces for the events and socket data used in the websocket server.
// These types are shared between the server and client for type safety.

// Events sent from the server to the client
export interface ServerToClientEvents {
  like: () => void; // Notifies the client that a like has been received
}

// Events sent from the client to the server
export interface ClientToServerEvents {
  like: () => void; // Client requests to send a like
}

// Events exchanged between servers (not used in this simple example)
export interface InterServerEvents {
  ping: () => void;
}

// Data stored on each socket connection (e.g., guest name)
export interface SocketData {
  name: string;
}
