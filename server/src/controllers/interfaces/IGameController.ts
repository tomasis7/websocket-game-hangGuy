// Game controller interface for handling game-related socket events
import { Socket } from "socket.io";
import { IBaseController } from "./IBaseController";
import {
  GuessLetterRequest,
  NewGameRequest,
  AsyncResult,
} from "../../../../shared/types";

export interface IGameController extends IBaseController {
  /**
   * Handle letter guess in hangman game
   */
  handleGuessLetter(
    socket: Socket,
    data: GuessLetterRequest
  ): AsyncResult<void>;

  /**
   * Handle new game request
   */
  handleNewGame(socket: Socket, data: NewGameRequest): AsyncResult<void>;

  /**
   * Handle getting current game state
   */
  handleGetGameState(
    socket: Socket,
    data: { gameId: string }
  ): AsyncResult<void>;

  /**
   * Handle starting a game
   */
  handleStartGame(socket: Socket, data: { gameId: string }): AsyncResult<void>;

  /**
   * Handle ending a game
   */
  handleEndGame(socket: Socket, data: { gameId: string }): AsyncResult<void>;

  /**
   * Handle resetting a game
   */
  handleResetGame(socket: Socket, data: { gameId: string }): AsyncResult<void>;
}
