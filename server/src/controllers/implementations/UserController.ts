// User controller implementation
import { Socket } from "socket.io";
import { IUserController } from "../interfaces/IUserController";
import { BaseController } from "./BaseController";
import {
  JoinGameRequest,
  AsyncResult,
  createSuccess,
  createError,
} from "../../../../shared/types";
import {
  createValidationError,
  toApplicationError,
} from "../../../../shared/errors";

export class UserController extends BaseController implements IUserController {
  getName(): string {
    return "UserController";
  }

  async handleJoinGame(
    socket: Socket,
    data: JoinGameRequest
  ): AsyncResult<void> {
    try {
      // Validate input
      if (!data?.gameId?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Game ID is required"),
          "joinGame"
        );
        return createError(createValidationError("Game ID is required"));
      }

      if (!data?.nickname?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Nickname is required"),
          "joinGame"
        );
        return createError(createValidationError("Nickname is required"));
      }

      // Create or get user
      const userResult = await this.userService.createUser(
        socket.id,
        data.nickname
      );
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "joinGame");
        return userResult;
      }

      const user = userResult.data;

      // Get or create game
      let gameResult = await this.gameService.getGame(data.gameId);
      if (!gameResult.success) {
        // Create new game if it doesn't exist
        const createResult = await this.gameService.createGame(
          data.gameId,
          user.id
        );
        if (!createResult.success) {
          await this.handleError(socket, createResult.error, "joinGame");
          return createResult;
        }
        gameResult = createResult;
      }

      // Add user to game
      const addPlayerResult = await this.gameService.addPlayerToGame(
        data.gameId,
        user
      );
      if (!addPlayerResult.success) {
        await this.handleError(socket, addPlayerResult.error, "joinGame");
        return addPlayerResult;
      }

      const game = addPlayerResult.data;

      // Join socket to game room
      const joinRoomResult = await this.socketService.joinRoom(
        socket.id,
        `game:${data.gameId}`
      );
      if (!joinRoomResult.success) {
        await this.handleError(socket, joinRoomResult.error, "joinGame");
        return joinRoomResult;
      } // Get the current game state for the joined player
      const gameStateResult = await this.gameService.getGameState(data.gameId);
      if (!gameStateResult.success) {
        console.warn("Could not retrieve game state:", gameStateResult.error);
      }

      const gameState = gameStateResult.success ? gameStateResult.data : null; // Emit success to joining user with expected hangman event structure
      console.log(
        `🎯 Emitting hangman:join-success to socket ${socket.id} for user ${user.nickname}`
      );
      await this.emitToSocket(socket, "hangman:join-success" as any, {
        gameState: gameState
          ? {
              word: gameState.word,
              guessedLetters: gameState.guessedLetters || [],
              correctGuesses: gameState.correctGuesses || [],
              incorrectGuesses: gameState.incorrectGuesses || [],
              remainingGuesses:
                gameState.remainingGuesses || gameState.maxGuesses || 6,
              maxGuesses: gameState.maxGuesses || 6,
              status: gameState.status || "playing",
              displayWord:
                gameState.displayWord ||
                gameState.word.replace(/[a-z]/gi, "_").split("").join(" "),
              players: game.players.map((p) => ({
                id: p.id,
                name: p.name,
                joinedAt: Date.now(),
                isActive: true,
                avatar: p.avatar,
              })),
              gameId: data.gameId,
              lastAction: gameState.lastAction,
            }
          : null,
        playerInfo: {
          id: user.id,
          name: user.nickname,
          joinedAt: Date.now(),
          isActive: true,
          avatar: user.avatar,
        },
        isGameInProgress: gameState ? gameState.status === "playing" : false,
        gameSummary: gameState
          ? `Game ${gameState.status}. ${gameState.remainingGuesses} guesses remaining.`
          : "Game ready to start",
        sessionId: data.gameId,
        timestamp: Date.now(),
      });
      console.log(
        `✅ Successfully emitted hangman:join-success to ${user.nickname}`
      );

      // Notify other players in the game using hangman events
      await this.emitToRoom(
        `game:${data.gameId}`,
        "hangman:player-action-broadcast" as any,
        {
          action: "joined",
          playerId: user.id,
          playerName: user.nickname,
          playerCount: game.players ? game.players.length : 0,
          gameState: gameState
            ? {
                word: gameState.word,
                guessedLetters: gameState.guessedLetters || [],
                correctGuesses: gameState.correctGuesses || [],
                incorrectGuesses: gameState.incorrectGuesses || [],
                remainingGuesses:
                  gameState.remainingGuesses || gameState.maxGuesses || 6,
                maxGuesses: gameState.maxGuesses || 6,
                status: gameState.status || "playing",
                displayWord:
                  gameState.displayWord ||
                  gameState.word.replace(/[a-z]/gi, "_").split("").join(" "),
                players: game.players.map((p) => ({
                  id: p.id,
                  name: p.name,
                  joinedAt: Date.now(),
                  isActive: true,
                  avatar: p.avatar,
                })),
                gameId: data.gameId,
                lastAction: gameState.lastAction,
              }
            : null,
          isNewPlayer: true,
          timestamp: Date.now(),
        }
      );
      console.log(`User ${user.nickname} joined game ${data.gameId}`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "joinGame");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleLeaveGame(socket: Socket): AsyncResult<void> {
    try {
      // Get user
      const userResult = await this.userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "leaveGame");
        return userResult;
      }

      const user = userResult.data;

      // Find games user is in and remove them
      const gamesResult = await this.gameService.getAllGames();
      if (!gamesResult.success) {
        await this.handleError(socket, gamesResult.error, "leaveGame");
        return gamesResult;
      }

      const userGames = gamesResult.data.filter((game) =>
        game.players.some((p) => p.id === user.id)
      );

      for (const game of userGames) {
        // Remove user from game
        const removeResult = await this.gameService.removePlayerFromGame(
          game.id,
          user.id
        );
        if (!removeResult.success) {
          console.error(
            `Failed to remove user ${user.id} from game ${game.id}:`,
            removeResult.error
          );
          continue;
        }

        // Leave socket room
        await this.socketService.leaveRoom(socket.id, `game:${game.id}`); // Notify other players
        await this.emitToRoom(`game:${game.id}`, "game:player-left", {
          gameId: game.id,
          userId: user.id,
          playerCount: removeResult.data.players
            ? removeResult.data.players.length
            : 0,
        } as any);

        console.log(`User ${user.nickname} left game ${game.id}`);
      } // Emit success to user
      await this.emitToSocket(socket, "game:leave-success", {
        gameId: "all", // Since user left all games
        message: "Successfully left all games",
      } as any);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "leaveGame");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleGetUserList(socket: Socket): AsyncResult<void> {
    try {
      const usersResult = await this.userService.getAllUsers();
      if (!usersResult.success) {
        await this.handleError(socket, usersResult.error, "getUserList");
        return usersResult;
      }
      await this.emitToSocket(socket, "users:list", {
        users: usersResult.data,
      } as any);

      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "getUserList");
      return createError(toApplicationError(error as Error));
    }
  }

  async handleUserIdentification(
    socket: Socket,
    data: { nickname: string }
  ): AsyncResult<void> {
    try {
      // Validate nickname
      if (!data?.nickname?.trim()) {
        await this.handleError(
          socket,
          createValidationError("Nickname is required"),
          "userIdentification"
        );
        return createError(createValidationError("Nickname is required"));
      }

      // Create or update user
      const userResult = await this.userService.createUser(
        socket.id,
        data.nickname
      );
      if (!userResult.success) {
        await this.handleError(socket, userResult.error, "userIdentification");
        return userResult;
      }

      const user = userResult.data; // Emit success
      await this.emitToSocket(socket, "users:identification-success" as any, {
        user,
      });

      console.log(`User identified: ${user.nickname} (${user.id})`);
      return createSuccess(undefined);
    } catch (error) {
      await this.handleError(socket, error as Error, "userIdentification");
      return createError(toApplicationError(error as Error));
    }
  }
}
