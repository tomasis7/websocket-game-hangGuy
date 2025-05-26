// Chat controller interface for handling chat-related socket events
import { Socket } from "socket.io";
import { IBaseController } from "./IBaseController";
import { ChatMessage, AsyncResult } from "../../../../shared/types";

export interface IChatController extends IBaseController {
  /**
   * Handle sending a chat message
   */
  handleSendMessage(
    socket: Socket,
    data: { message: string; gameId?: string }
  ): AsyncResult<void>;

  /**
   * Handle getting chat history
   */
  handleGetChatHistory(
    socket: Socket,
    data: { gameId?: string; limit?: number }
  ): AsyncResult<void>;

  /**
   * Handle joining a chat room
   */
  handleJoinChatRoom(
    socket: Socket,
    data: { roomId: string }
  ): AsyncResult<void>;

  /**
   * Handle leaving a chat room
   */
  handleLeaveChatRoom(
    socket: Socket,
    data: { roomId: string }
  ): AsyncResult<void>;
}
