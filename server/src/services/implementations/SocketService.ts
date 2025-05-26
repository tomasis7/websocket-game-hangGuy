// Socket service implementation
import { Socket, Server } from "socket.io";
import { ISocketService } from "../interfaces/ISocketService";
import {
  SocketEventName,
  ClientToServerEvents,
  ServerToClientEvents,
  Result,
  AsyncResult,
  createSuccess,
  createError,
} from "../../../../shared/types";
import {
  ApplicationError,
  createNotFoundError,
  createValidationError,
} from "../../../../shared/errors";

export class SocketService implements ISocketService {
  private sockets = new Map<string, Socket>();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async registerSocket(socket: Socket): AsyncResult<void> {
    try {
      this.sockets.set(socket.id, socket);
      console.log(`Socket registered: ${socket.id}`);
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error registering socket:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to register socket")
      );
    }
  }

  async unregisterSocket(socketId: string): AsyncResult<void> {
    try {
      const removed = this.sockets.delete(socketId);
      if (removed) {
        console.log(`Socket unregistered: ${socketId}`);
      }
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error unregistering socket:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to unregister socket")
      );
    }
  }

  getSocket(socketId: string): Socket | null {
    return this.sockets.get(socketId) || null;
  }
  async emitToSocket<T extends keyof ServerToClientEvents>(
    socketId: string,
    event: T,
    data: ServerToClientEvents[T]
  ): AsyncResult<void> {
    try {
      const socket = this.sockets.get(socketId);
      if (!socket) {
        return createError(createNotFoundError("Socket", socketId));
      }

      socket.emit(event, data);
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error emitting to socket:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to emit to socket")
      );
    }
  }
  async emitToRoom<T extends keyof ServerToClientEvents>(
    room: string,
    event: T,
    data: ServerToClientEvents[T]
  ): AsyncResult<void> {
    try {
      if (!room?.trim()) {
        return createError(createValidationError("Room name is required"));
      }

      this.io.to(room).emit(event, data);
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error emitting to room:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to emit to room")
      );
    }
  }

  async joinRoom(socketId: string, room: string): AsyncResult<void> {
    try {
      const socket = this.sockets.get(socketId);
      if (!socket) {
        return createError(createNotFoundError("Socket", socketId));
      }

      if (!room?.trim()) {
        return createError(createValidationError("Room name is required"));
      }

      await socket.join(room);
      console.log(`Socket ${socketId} joined room ${room}`);
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error joining room:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to join room")
      );
    }
  }

  async leaveRoom(socketId: string, room: string): AsyncResult<void> {
    try {
      const socket = this.sockets.get(socketId);
      if (!socket) {
        return createError(createNotFoundError("Socket", socketId));
      }

      if (!room?.trim()) {
        return createError(createValidationError("Room name is required"));
      }

      await socket.leave(room);
      console.log(`Socket ${socketId} left room ${room}`);
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error leaving room:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to leave room")
      );
    }
  }

  async getSocketsInRoom(room: string): AsyncResult<Socket[]> {
    try {
      if (!room?.trim()) {
        return createError(createValidationError("Room name is required"));
      }

      const socketIds = await this.io.in(room).allSockets();
      const sockets: Socket[] = [];

      for (const socketId of socketIds) {
        const socket = this.sockets.get(socketId);
        if (socket) {
          sockets.push(socket);
        }
      }

      return createSuccess(sockets);
    } catch (error) {
      console.error("Error getting sockets in room:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get sockets in room")
      );
    }
  }

  async getSocketRooms(socketId: string): AsyncResult<string[]> {
    try {
      const socket = this.sockets.get(socketId);
      if (!socket) {
        return createError(createNotFoundError("Socket", socketId));
      }

      const rooms = Array.from(socket.rooms).filter(
        (room) => room !== socketId
      );
      return createSuccess(rooms);
    } catch (error) {
      console.error("Error getting socket rooms:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get socket rooms")
      );
    }
  }
  async broadcast<T extends keyof ServerToClientEvents>(
    event: T,
    data: ServerToClientEvents[T]
  ): AsyncResult<void> {
    try {
      this.io.emit(event, data);
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error broadcasting:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to broadcast")
      );
    }
  }
}
