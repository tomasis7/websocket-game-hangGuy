// Base controller implementation with common functionality
import { Socket } from "socket.io";
import { IBaseController } from "../interfaces/IBaseController";
import {
  AsyncResult,
  createSuccess,
  createError,
} from "../../../../shared/types";
import { ApplicationError } from "../../../../shared/errors";
import { container } from "../../services/container";

export abstract class BaseController implements IBaseController {
  protected userService = container.getUserService();
  protected gameService = container.getGameService();
  protected socketService = container.getSocketService();

  async initialize(): AsyncResult<void> {
    try {
      console.log(`${this.getName()} controller initialized`);
      return createSuccess(undefined);
    } catch (error) {
      console.error(`Error initializing ${this.getName()} controller:`, error);
      return createError(
        new ApplicationError(
          "INTERNAL_ERROR",
          `Failed to initialize ${this.getName()} controller`
        )
      );
    }
  }

  async handleConnection(socket: Socket): AsyncResult<void> {
    try {
      const result = await this.socketService.registerSocket(socket);
      if (!result.success) {
        return result;
      }

      console.log(`${this.getName()}: Socket connected - ${socket.id}`);
      return createSuccess(undefined);
    } catch (error) {
      console.error(`Error handling connection in ${this.getName()}:`, error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to handle connection")
      );
    }
  }

  async handleDisconnection(socket: Socket): AsyncResult<void> {
    try {
      // Get user before removing socket
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (userResult.success) {
        // Remove user from any games they're in
        const gamesResult = await this.gameService.getAllGames();
        if (gamesResult.success) {
          for (const game of gamesResult.data) {
            if (game.players.some((p) => p.id === userResult.data.id)) {
              await this.gameService.removePlayerFromGame(
                game.id,
                userResult.data.id
              );              await this.socketService.emitToRoom(
                `game:${game.id}`,
                "game:player-left" as any,
                {
                  gameId: game.id,
                  userId: userResult.data.id,
                  playerCount: game.players ? game.players.length : 0,
                }
              );
            }
          }
        }

        // Remove user
        await this.userService.removeUser(userResult.data.id);
      }

      // Unregister socket
      await this.socketService.unregisterSocket(socket.id);

      console.log(`${this.getName()}: Socket disconnected - ${socket.id}`);
      return createSuccess(undefined);
    } catch (error) {
      console.error(
        `Error handling disconnection in ${this.getName()}:`,
        error
      );
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to handle disconnection")
      );
    }
  }

  abstract getName(): string;

  protected async handleError(
    socket: Socket,
    error: ApplicationError | Error,
    context: string
  ): Promise<void> {
    const errorMessage =
      error instanceof ApplicationError
        ? error.message
        : "An unexpected error occurred";
    const errorCode =
      error instanceof ApplicationError ? error.code : "INTERNAL_ERROR";    console.error(`${this.getName()} - ${context}:`, error);
    await this.emitToSocket(socket, "error" as any, errorMessage);
  }

  protected async emitToSocket<
    T extends keyof import("../../../../shared/types").ServerToClientEvents
  >(
    socket: Socket,
    event: T,
    data: import("../../../../shared/types").ServerToClientEvents[T]
  ): Promise<void> {
    const result = await this.socketService.emitToSocket(
      socket.id,
      event,
      data
    );
    if (!result.success) {
      console.error(
        `Failed to emit ${event} to socket ${socket.id}:`,
        result.error
      );
    }
  }

  protected async emitToRoom<
    T extends keyof import("../../../../shared/types").ServerToClientEvents
  >(
    room: string,
    event: T,
    data: import("../../../../shared/types").ServerToClientEvents[T]
  ): Promise<void> {
    const result = await this.socketService.emitToRoom(room, event, data);
    if (!result.success) {
      console.error(`Failed to emit ${event} to room ${room}:`, result.error);
    }
  }
}
