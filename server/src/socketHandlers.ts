import { Server, Socket } from "socket.io";
import { MultiplayerHangmanGame } from "./MultiplayerHangmanGame";
import { UserManager } from "./userManager";
import { GameStateSynchronizer } from "./gameStateSynchronizer";
import {
  GameStateEvent,
  JoinGameRequest,
  GuessLetterRequest,
  NewGameRequest,
} from "../../shared/types";

const hangmanGame = new MultiplayerHangmanGame();

export class SocketHandlers {
  private userManager = new UserManager();
  private readonly HANGMAN_ROOM = "hangman-room";
  private readonly SESSION_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  setupHandlers(io: Server): void {
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Setup all event handlers
      this.setupJoinGameHandler(socket, io);
      this.setupLeaveGameHandler(socket);
      this.setupUserListHandler(socket);
      this.setupGuessLetterHandler(socket, io);
      this.setupNewGameHandler(socket, io);
      this.setupHangmanLeaveHandler(socket, io);
      this.setupDisconnectHandler(socket, io);
    });

    // Cleanup inactive sessions periodically
    this.startSessionCleanup();
  }

  private setupJoinGameHandler(socket: Socket, io: Server): void {
    socket.on("joinGame", (request: JoinGameRequest & { userId?: string }) => {
      try {
        const { nickname, sessionId = "default" } = request;

        if (!nickname?.trim()) {
          socket.emit("error", "Nickname is required");
          return;
        }

        const user = this.userManager.createUser(socket.id, nickname);
        const session = this.userManager.addUserToSession(user.id, sessionId);

        socket.join(sessionId);

        // Send session info to new user
        socket.emit("sessionInfo", {
          id: session.id,
          userCount: session.users.length,
        });

        // Broadcast user joined to others in session
        socket.to(sessionId).emit("userJoined", user);

        // Send updated user list to all users in session
        io.to(sessionId).emit("userListUpdated", session.users);

        // Sync game state for new user using GameStateSynchronizer
        GameStateSynchronizer.syncNewPlayer(socket, hangmanGame);

        console.log(`User ${user.nickname} joined session ${sessionId}`);
      } catch (error) {
        console.error("Error joining game:", error);
        socket.emit("error", "Failed to join game");
      }
    });
  }

  private setupLeaveGameHandler(socket: Socket): void {
    socket.on("leaveGame", () => {
      this.handleUserDisconnect(socket);
    });
  }

  private setupUserListHandler(socket: Socket): void {
    socket.on("getUserList", () => {
      try {
        const user = this.userManager.getUserBySocketId(socket.id);
        if (!user) {
          socket.emit("error", "User not found");
          return;
        }

        const sessions = this.userManager.getAllActiveSessions();
        const userSession = sessions.find((session) =>
          session.users.some((sessionUser) => sessionUser.id === user.id)
        );

        if (userSession) {
          socket.emit("userListUpdated", userSession.users);
        }
      } catch (error) {
        console.error("Error getting user list:", error);
        socket.emit("error", "Failed to get user list");
      }
    });
  }

  private setupGuessLetterHandler(socket: Socket, io: Server): void {
    socket.on("hangman:guess-letter", (data: GuessLetterRequest) => {
      const playerId = socket.id;

      try {
        // Validate input
        if (!data?.letter || typeof data.letter !== "string") {
          socket.emit("hangman:error", {
            message: "Invalid letter provided",
            code: "INVALID_INPUT",
          });
          return;
        }

        const letter = data.letter.toUpperCase().trim();

        // Validate letter format
        if (!/^[A-Z]$/.test(letter)) {
          socket.emit("hangman:error", {
            message: "Please provide a single letter A-Z",
            code: "INVALID_LETTER_FORMAT",
          });
          return;
        }

        // Check if player can make this guess
        const canGuess = hangmanGame.canPlayerGuess(playerId, letter);
        if (!canGuess.canGuess) {
          socket.emit("hangman:error", {
            message: canGuess.reason || "Cannot make guess",
            code: "INVALID_GUESS",
          });
          return;
        }

        // Process the guess
        const result = hangmanGame.processGuess(letter, playerId);

        // Broadcast result to all players using GameStateSynchronizer
        GameStateSynchronizer.broadcastGameUpdate(
          io,
          this.HANGMAN_ROOM,
          hangmanGame
        );

        // Send specific guess result
        io.to(this.HANGMAN_ROOM).emit("hangman:guess-result", {
          letter,
          isCorrect: result.isCorrect,
          playerId,
          playerName: data.playerName || `Player ${playerId.slice(-4)}`,
          gameState: result.gameState,
        });

        console.log(
          `Player ${playerId} guessed "${letter}" - ${
            result.isCorrect ? "Correct" : "Incorrect"
          }`
        );
      } catch (error) {
        console.error("Error processing guess:", error);
        socket.emit("hangman:error", {
          message: "Failed to process guess",
          code: "GUESS_ERROR",
        });
      }
    });
  }

  private setupNewGameHandler(socket: Socket, io: Server): void {
    socket.on("hangman:new-game", (data?: NewGameRequest) => {
      const playerId = socket.id;

      try {
        // Validate that player can start new game
        if (!hangmanGame.getPlayers().has(playerId)) {
          socket.emit("hangman:error", {
            message: "You must be in the game to start a new one",
            code: "NOT_IN_GAME",
          });
          return;
        }

        const gameState = hangmanGame.startNewGame(data);

        // Broadcast new game to all players
        io.to(this.HANGMAN_ROOM).emit("hangman:game-started", {
          startedBy: playerId,
          gameState,
        });

        // Sync game state to all players
        GameStateSynchronizer.broadcastGameUpdate(
          io,
          this.HANGMAN_ROOM,
          hangmanGame
        );

        console.log(`New game started by player ${playerId}`);
      } catch (error) {
        console.error("Error starting new game:", error);
        socket.emit("hangman:error", {
          message: "Failed to start new game",
          code: "NEW_GAME_ERROR",
        });
      }
    });
  }

  private setupHangmanLeaveHandler(socket: Socket, io: Server): void {
    socket.on("hangman:leave-game", (data: { userId: string }) => {
      try {
        const playerId = socket.id;

        // Validate input
        if (!data?.userId) {
          socket.emit("hangman:error", {
            message: "User ID is required",
            code: "MISSING_USER_ID",
          });
          return;
        }

        // Remove from game
        const wasRemoved = hangmanGame.removePlayer(playerId);

        if (wasRemoved) {
          // Use GameStateSynchronizer for proper cleanup
          GameStateSynchronizer.handlePlayerDisconnect(socket, hangmanGame, io);

          console.log(`Player ${playerId} left the game`);
        }

        // Leave the room
        socket.leave(this.HANGMAN_ROOM);
      } catch (error) {
        console.error("Error handling leave game:", error);
        socket.emit("hangman:error", {
          message: "Failed to leave game",
          code: "LEAVE_ERROR",
        });
      }
    });
  }

  private setupDisconnectHandler(socket: Socket, io: Server): void {
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      try {
        // Clean up user from game
        const wasRemoved = hangmanGame.removePlayer(socket.id);

        if (wasRemoved) {
          // Use GameStateSynchronizer for cleanup
          GameStateSynchronizer.handlePlayerDisconnect(socket, hangmanGame, io);
        }

        // Clean up user manager
        this.userManager.removeUser(socket.id);
      } catch (error) {
        console.error("Error during disconnect cleanup:", error);
      }
    });
  }

  private startSessionCleanup(): void {
    setInterval(() => {
      try {
        this.userManager.cleanupInactiveSessions();
      } catch (error) {
        console.error("Error during session cleanup:", error);
      }
    }, this.SESSION_CLEANUP_INTERVAL);
  }

  private handleUserDisconnect(socket: Socket): void {
    try {
      const user = this.userManager.getUserBySocketId(socket.id);
      if (!user) {
        console.log("User not found for disconnect:", socket.id);
        return;
      }

      const sessions = this.userManager.getAllActiveSessions();
      const userSession = sessions.find((session) =>
        session.users.some((sessionUser) => sessionUser.id === user.id)
      );

      this.userManager.removeUser(user.id);

      if (userSession) {
        // Notify remaining users
        socket.to(userSession.id).emit("userLeft", user.id);
        socket.to(userSession.id).emit("userListUpdated", userSession.users);

        console.log(`User ${user.nickname} left session ${userSession.id}`);
      }

      console.log("User disconnected cleanup completed:", socket.id);
    } catch (error) {
      console.error("Error handling user disconnect:", error);
    }
  }
}

// Move interfaces to shared types file instead
export interface ServerToClientEvents {
  "hangman:game-started": (data: {
    startedBy: string;
    gameState: GameStateEvent;
  }) => void;
  "hangman:guess-result": (data: {
    letter: string;
    isCorrect: boolean;
    playerId: string;
    playerName: string;
    gameState: GameStateEvent;
  }) => void;
  "hangman:player-left": (data: {
    playerId: string;
    playerCount: number;
    timestamp: number;
  }) => void;
}
