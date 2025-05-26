// User controller interface for handling user-related socket events
import { Socket } from "socket.io";
import { IBaseController } from "./IBaseController";
import { JoinGameRequest, AsyncResult } from "../../../../shared/types";

export interface IUserController extends IBaseController {
  /**
   * Handle user joining a game
   */
  handleJoinGame(socket: Socket, data: JoinGameRequest): AsyncResult<void>;

  /**
   * Handle user leaving a game
   */
  handleLeaveGame(socket: Socket): AsyncResult<void>;

  /**
   * Handle getting user list
   */
  handleGetUserList(socket: Socket): AsyncResult<void>;

  /**
   * Handle user identification/authentication
   */
  handleUserIdentification(
    socket: Socket,
    data: { nickname: string }
  ): AsyncResult<void>;
}
