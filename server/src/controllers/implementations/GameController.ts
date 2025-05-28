// Game controller implementation
import { Socket } from "socket.io";
import { IGameController } from "../interfaces/IGameController";
import { BaseController } from "./BaseController";
import {
  GuessLetterRequest,
  NewGameRequest,
  AsyncResult,
  createSuccess,
  createError,
} from "../../../../shared/types";
import {
  createValidationError,
  createNotFoundError,
  toApplicationError,
} from "../../../../shared/errors";

export class GameController extends BaseController implements IGameController {
  getName(): string {
    return "GameController";
  }

  async handleGuessLetter(
    socket: Socket,
    data: GuessLetterRequest
  ): AsyncResult<void> {
    try {
      // Validate input
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "guessLetter"
        );
        return createError(createValidationError("Game ID is required"));
      }

      if (!data?.letter?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Letter is required"),
          "guessLetter"
        );
        return createError(createValidationError("Letter is required"));
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "guessLetter");
        return userResult;
      }

      const user = userResult.data;

      // Make guess
      const guessResult = await this.gameService.makeGuess(
        data.gameId,
        user.id,
        data.letter
      );
      if (!guessResult.success) {
        await this.handleError(socket, guessResult.error, "guessLetter");
        return guessResult;
      }
      const game = guessResult.data;

      // Create clean, serializable game state to avoid circular references
      const cleanGameState = {
        word: game.state.word,
        currentWord: game.state.currentWord,
        correctGuesses: [...game.state.correctGuesses],
        incorrectGuesses: [...game.state.incorrectGuesses],
        guessedLetters: [...game.state.guessedLetters],
        remainingGuesses: game.state.remainingGuesses,
        maxGuesses: game.state.maxGuesses,
        maxIncorrectGuesses: game.state.maxIncorrectGuesses,
        status: game.state.status,
        displayWord: game.state.displayWord,
      };

      // Emit to all players in the game using hangman events
      await this.emitToRoom(
        `game:${data.gameId}`,
        "hangman:guess-broadcast" as any,
        {
          gameId: data.gameId,
          playerName: user.nickname,
          letter: data.letter.toLowerCase(),
          isCorrect: game.state.currentWord.includes(data.letter.toLowerCase()),
          gameState: cleanGameState,
          timestamp: Date.now(),
        }
      );

      // Also emit game state update
      await this.emitToRoom(
        `game:${data.gameId}`,
        "hangman:game-state" as any,
        {
          gameId: data.gameId,
          ...cleanGameState,
          players: game.players.map((p) => ({
            id: p.id,
            name: p.name,
            joinedAt: p.joinedAt,
            isActive: p.isActive,
            avatar: p.avatar,
          })),
        }
      ); // If game ended, emit game over event
      if (game.state.status === "won" || game.state.status === "lost") {
        await this.emitToRoom(
          `game:${data.gameId}`,
          "hangman:game-end-broadcast" as any,
          {
            gameId: data.gameId,
            gameState: cleanGameState,
            winner: game.state.status === "won" ? user.nickname : undefined,
            timestamp: Date.now(),
          }
        );
      }

      console.log(
        `User ${user.nickname} guessed "${data.letter}" in game ${data.gameId}`
      );
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "guessLetter");
      return createError(toApplicationError(error as Error));
    }
  }
  async handleNewGame(socket: Socket, data: NewGameRequest): AsyncResult<void> {
    try {
      // Validate input
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "newGame"
        );
        return createError(createValidationError("Game ID is required"));
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "newGame");
        return userResult;
      }

      const user = userResult.data;

      // Get existing game or create if it doesn't exist
      let gameResult = await this.gameService.getGame(data.gameId);
      if (!gameResult.success) {
        // Create new game if it doesn't exist
        const createResult = await this.gameService.createGame(
          data.gameId,
          user.id
        );
        if (!createResult.success) {
          await this.handleError(socket, createResult.error, "newGame");
          return createResult;
        }
        gameResult = createResult;
      }

      // Start/restart the game (reset game state and change status to playing)
      const startGameResult = await this.gameService.startGame(data.gameId);
      if (!startGameResult.success) {
        await this.handleError(socket, startGameResult.error, "newGame");
        return startGameResult;
      }

      const updatedGame = startGameResult.data;

      // Join socket to game room (if not already in it)
      await this.socketService.joinRoom(socket.id, `game:${data.gameId}`); // Emit game start broadcast to all players in the room
      // Create clean, serializable game state to avoid circular references
      const cleanGameState = {
        word: updatedGame.state.word,
        currentWord: updatedGame.state.currentWord,
        correctGuesses: [...updatedGame.state.correctGuesses],
        incorrectGuesses: [...updatedGame.state.incorrectGuesses],
        guessedLetters: [...updatedGame.state.guessedLetters],
        remainingGuesses: updatedGame.state.remainingGuesses,
        maxGuesses: updatedGame.state.maxGuesses,
        maxIncorrectGuesses: updatedGame.state.maxIncorrectGuesses,
        status: updatedGame.state.status,
        displayWord: updatedGame.state.displayWord,
        players: updatedGame.players.map((p) => ({
          id: p.id,
          name: p.name,
          joinedAt: p.joinedAt,
          isActive: p.isActive,
          avatar: p.avatar,
        })),
      };

      await this.emitToRoom(
        `game:${data.gameId}`,
        "hangman:game-start-broadcast" as any,
        {
          startedBy: user.id,
          startedByName: user.nickname,
          gameState: cleanGameState,
          timestamp: Date.now(),
        }
      );

      console.log(`🎮 New game started: ${data.gameId} by ${user.nickname}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "newGame");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleGetGameState(
    socket: Socket,
    data: { gameId: string }
  ): AsyncResult<void> {
    try {
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "getGameState"
        );
        return createError(createValidationError("Game ID is required"));
      }

      const gameResult = await this.gameService.getGame(data.gameId);
      if (!gameResult.success) {
        await this.handleError(socket, gameResult.error, "getGameState");
        return gameResult;
      }
      const game = gameResult.data;
      await this.emitToSocket(socket, "hangman:game-state" as any, {
        gameId: data.gameId,
        ...game.state,
        players: game.players.map((p) => ({
          id: p.id,
          name: p.name,
          joinedAt: Date.now(),
          isActive: true,
          avatar: p.avatar,
        })),
      });

      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "getGameState");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleStartGame(
    socket: Socket,
    data: { gameId: string }
  ): AsyncResult<void> {
    try {
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "startGame"
        );
        return createError(createValidationError("Game ID is required"));
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "startGame");
        return userResult;
      }

      const user = userResult.data;

      // Start game
      const gameResult = await this.gameService.startGame(data.gameId);
      if (!gameResult.success) {
        await this.handleError(socket, gameResult.error, "startGame");
        return gameResult;
      }
      const game = gameResult.data; // Emit to all players in the game using hangman events
      await this.emitToRoom(
        `game:${data.gameId}`,
        "hangman:game-start-broadcast" as any,
        {
          gameId: data.gameId,
          gameState: game.state,
          startedByName: user.nickname,
          timestamp: Date.now(),
        }
      );

      console.log(`Game ${data.gameId} started by ${user.nickname}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "startGame");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleEndGame(
    socket: Socket,
    data: { gameId: string }
  ): AsyncResult<void> {
    try {
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "endGame"
        );
        return createError(createValidationError("Game ID is required"));
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "endGame");
        return userResult;
      }

      const user = userResult.data;

      // End game
      const gameResult = await this.gameService.endGame(data.gameId);
      if (!gameResult.success) {
        await this.handleError(socket, gameResult.error, "endGame");
        return gameResult;
      }

      const game = gameResult.data; // Emit to all players in the game
      await this.emitToRoom(`game:${data.gameId}`, "game:ended", {
        gameId: data.gameId,
        gameState: game.state,
        winner: undefined,
      } as any);

      console.log(`Game ${data.gameId} ended by ${user.nickname}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "endGame");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleResetGame(
    socket: Socket,
    data: { gameId: string }
  ): AsyncResult<void> {
    try {
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "resetGame"
        );
        return createError(createValidationError("Game ID is required"));
      }

      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "resetGame");
        return userResult;
      }

      const user = userResult.data;

      // Reset game
      const gameResult = await this.gameService.resetGame(data.gameId);
      if (!gameResult.success) {
        await this.handleError(socket, gameResult.error, "resetGame");
        return gameResult;
      }

      const game = gameResult.data; // Emit to all players in the game
      await this.emitToRoom(`game:${data.gameId}`, "game:reset", {
        gameId: data.gameId,
        gameState: game.state,
      } as any);

      console.log(`Game ${data.gameId} reset by ${user.nickname}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "resetGame");
      return createError(toApplicationError(error as Error));
    }
  }
}
