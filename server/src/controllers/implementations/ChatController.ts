// Chat controller implementation
import { Socket } from "socket.io";
import { IChatController } from "../interfaces/IChatController";
import { BaseController } from "./BaseController";
import {
  AsyncResult,
  createSuccess,
  createError,
  ChatMessage,
  ApplicationError,
} from "../../../../shared/types";
import {
  createValidationError,
  toApplicationError,
} from "../../../../shared/errors";

interface StoredChatMessage {
  id: string;
  userId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: "chat" | "system" | "game";
  gameId?: string;
  roomId?: string;
}

export class ChatController extends BaseController implements IChatController {
  private messages = new Map<string, StoredChatMessage[]>(); // roomId -> messages
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly MAX_MESSAGES_PER_ROOM = 100;

  getName(): string {
    return "ChatController";
  }

  async handleSendMessage(
    socket: Socket,
    data: { message: string; gameId?: string }
  ): AsyncResult<void> {
    try {
      // Validate input
      if (!data?.message?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Message is required"),
          "sendMessage"
        );
        return createError(createValidationError("Message is required"));
      }

      if (data.message.length > this.MAX_MESSAGE_LENGTH) {
        await this.handleError(
          socket,
          createValidationError(
            `Message must be ${this.MAX_MESSAGE_LENGTH} characters or less`
          ),
          "sendMessage"
        );
        return createError(
          createValidationError(
            `Message must be ${this.MAX_MESSAGE_LENGTH} characters or less`
          )
        );
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "sendMessage");
        return userResult;
      }

      const user = userResult.data;

      // Determine room ID (game room or global chat)
      const roomId = data.gameId ? `game:${data.gameId}` : "global"; // Create chat message
      const chatMessage: StoredChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        userId: user.id,
        playerName: user.nickname,
        message: data.message.trim(),
        timestamp: Date.now(),
        type: "chat",
        gameId: data.gameId,
        roomId,
      };

      // Store message
      this.storeMessage(roomId, chatMessage); // Emit to room
      await this.emitToRoom(roomId, "chat:message", {
        message: {
          id: chatMessage.id,
          userId: chatMessage.userId,
          playerName: chatMessage.playerName,
          message: chatMessage.message,
          timestamp: chatMessage.timestamp,
          type: chatMessage.type,
        },
        roomId,
      } as any);

      console.log(
        `Chat message sent by ${user.nickname} in ${roomId}: ${data.message}`
      );
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "sendMessage");
      return createError(
        new ApplicationError("INTERNAL_ERROR", (error as Error).message)
      );
    }
  }

  async handleGetChatHistory(
    socket: Socket,
    data: { gameId?: string; limit?: number }
  ): AsyncResult<void> {
    try {
      const limit = Math.min(data?.limit || 50, 100); // Max 100 messages
      const roomId = data?.gameId ? `game:${data.gameId}` : "global"; // Get messages for room
      const roomMessages = this.messages.get(roomId) || [];
      const recentMessages = roomMessages.slice(-limit).map((msg) => ({
        id: msg.id,
        userId: msg.userId,
        playerName: msg.playerName,
        message: msg.message,
        timestamp: msg.timestamp,
        type: msg.type,
      }));

      await this.emitToSocket(socket, "chat:history", {
        messages: recentMessages,
        roomId: data?.gameId ? data.gameId : undefined,
      } as any);

      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "getChatHistory");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleJoinChatRoom(
    socket: Socket,
    data: { roomId: string }
  ): AsyncResult<void> {
    try {
      if (!data?.roomId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Room ID is required"),
          "joinChatRoom"
        );
        return createError(createValidationError("Room ID is required"));
      }

      // Join socket to chat room
      const joinResult = await this.socketService.joinRoom(
        socket.id,
        data.roomId
      );
      if (!joinResult.success) {
        await this.handleError(socket, joinResult.error, "joinChatRoom");
        return joinResult;
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (userResult.success) {
        // Notify room that user joined
        await this.emitToRoom(data.roomId, "chat:user-joined", {
          user: userResult.data,
          roomId: data.roomId,
        } as any);
      }

      console.log(`Socket ${socket.id} joined chat room ${data.roomId}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "joinChatRoom");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleLeaveChatRoom(
    socket: Socket,
    data: { roomId: string }
  ): AsyncResult<void> {
    try {
      if (!data?.roomId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Room ID is required"),
          "leaveChatRoom"
        );
        return createError(createValidationError("Room ID is required"));
      }

      // Get user before leaving
      const userResult = await this.userService.getUserBySocketId(socket.id);

      // Leave socket from chat room
      const leaveResult = await this.socketService.leaveRoom(
        socket.id,
        data.roomId
      );
      if (!leaveResult.success) {
        await this.handleError(socket, leaveResult.error, "leaveChatRoom");
        return leaveResult;
      }

      if (userResult.success) {
        // Notify room that user left
        await this.emitToRoom(data.roomId, "chat:user-left", {
          user: userResult.data,
          userId: userResult.data.id,
          roomId: data.roomId,
        } as any);
      }
      console.log(`Socket ${socket.id} left chat room ${data.roomId}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "leaveChatRoom");
      return createError(toApplicationError(error as Error));
    }
  }

  private storeMessage(roomId: string, message: StoredChatMessage): void {
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }

    const roomMessages = this.messages.get(roomId)!;
    roomMessages.push(message);

    // Keep only the most recent messages
    if (roomMessages.length > this.MAX_MESSAGES_PER_ROOM) {
      roomMessages.splice(0, roomMessages.length - this.MAX_MESSAGES_PER_ROOM);
    }
  }
}
