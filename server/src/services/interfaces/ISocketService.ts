// Service interface for socket management operations
import { Socket, Server } from "socket.io";
import {
  SocketEventName,
  ClientToServerEvents,
  ServerToClientEvents,
  Result,
  AsyncResult,
} from "../../../../shared/types";

export interface ISocketService {
  /**
   * Register a socket connection
   */
  registerSocket(socket: Socket): AsyncResult<void>;

  /**
   * Unregister a socket connection
   */
  unregisterSocket(socketId: string): AsyncResult<void>;

  /**
   * Get socket by ID
   */
  getSocket(socketId: string): Socket | null;
  /**
   * Emit event to specific socket
   */
  emitToSocket<T extends keyof ServerToClientEvents>(
    socketId: string,
    event: T,
    data: ServerToClientEvents[T]
  ): AsyncResult<void>;

  /**
   * Emit event to room
   */
  emitToRoom<T extends keyof ServerToClientEvents>(
    room: string,
    event: T,
    data: ServerToClientEvents[T]
  ): AsyncResult<void>;

  /**
   * Join socket to room
   */
  joinRoom(socketId: string, room: string): AsyncResult<void>;

  /**
   * Leave socket from room
   */
  leaveRoom(socketId: string, room: string): AsyncResult<void>;

  /**
   * Get all sockets in room
   */
  getSocketsInRoom(room: string): AsyncResult<Socket[]>;

  /**
   * Get socket rooms
   */
  getSocketRooms(socketId: string): AsyncResult<string[]>;
  /**
   * Broadcast to all connected sockets
   */
  broadcast<T extends keyof ServerToClientEvents>(
    event: T,
    data: ServerToClientEvents[T]
  ): AsyncResult<void>;
}
