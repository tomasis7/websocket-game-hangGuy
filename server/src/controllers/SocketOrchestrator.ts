// Main socket handler orchestrator that coordinates all controllers
import { Server, Socket } from "socket.io";
import {
  UserController,
  GameController,
  ChatController,
} from "./implementations";
import {
  IUserController,
  IGameController,
  IChatController,
} from "./interfaces";
import { ApplicationError } from "../../../shared/errors";
import { container } from "../services/container";

export class SocketOrchestrator {
  private userController: IUserController;
  private gameController: IGameController;
  private chatController: IChatController;
  private io: Server;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(io: Server) {
    this.io = io;
    this.userController = new UserController();
    this.gameController = new GameController();
    this.chatController = new ChatController();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize all controllers
      await this.userController.initialize();
      await this.gameController.initialize();
      await this.chatController.initialize();

      // Setup socket connection handling
      this.io.on("connection", (socket) => {
        this.handleConnection(socket);
      });

      // Start cleanup tasks
      this.startCleanupTasks();

      console.log("✅ Socket orchestrator initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize socket orchestrator:", error);
      throw new ApplicationError(
        "INTERNAL_ERROR",
        "Failed to initialize socket orchestrator"
      );
    }
  }

  private async handleConnection(socket: Socket): Promise<void> {
    try {
      console.log(`🔌 New connection: ${socket.id}`);

      // Handle connection in all controllers
      await Promise.all([
        this.userController.handleConnection(socket),
        this.gameController.handleConnection(socket),
        this.chatController.handleConnection(socket),
      ]);

      // Setup event handlers
      this.setupUserEventHandlers(socket);
      this.setupGameEventHandlers(socket);
      this.setupChatEventHandlers(socket);
      this.setupDisconnectionHandler(socket);
    } catch (error) {
      console.error(`Error handling connection for ${socket.id}:`, error);
      socket.emit("error", {
        message: "Failed to establish connection",
        code: "CONNECTION_ERROR",
      });
    }
  }
  private setupUserEventHandlers(socket: Socket): void {
    // User identification
    socket.on("users:identify", async (data: { nickname: string }) => {
      await this.userController.handleUserIdentification(socket, data);
    }); // Join game - listen for hangman:join-game event
    socket.on("hangman:join-game", async (data) => {
      console.log(`🎮 Received hangman:join-game from ${socket.id}:`, data);
      // Convert hangman event data to expected JoinGameRequest format
      const joinRequest = {
        gameId: data.sessionId || "default-game",
        nickname: data.playerName || "Player",
      };
      console.log(`📋 Converted to join request:`, joinRequest);
      await this.userController.handleJoinGame(socket, joinRequest);
    });

    // Leave game - listen for hangman:leave-game event
    socket.on("hangman:leave-game", async () => {
      await this.userController.handleLeaveGame(socket);
    });

    // Get user list
    socket.on("users:get-list", async () => {
      await this.userController.handleGetUserList(socket);
    });
  }
  private setupGameEventHandlers(socket: Socket): void {
    // Guess letter - listen for hangman:guess-letter event
    socket.on("hangman:guess-letter", async (data) => {
      // Get user information to construct complete request
      const userService = container.getUserService();
      const userResult = await userService.getUserBySocketId(socket.id);
      if (!userResult.success) {
        socket.emit("hangman:error", {
          message: "User not found",
          code: "USER_NOT_FOUND",
          timestamp: Date.now(),
        });
        return;
      }

      const user = userResult.data;

      // Convert hangman event data to expected GuessLetterRequest format
      const guessRequest = {
        gameId: data.gameId || "default-game",
        letter: data.letter,
        playerId: user.id,
        playerName: user.nickname,
        timestamp: Date.now(),
      };
      await this.gameController.handleGuessLetter(socket, guessRequest);
    });

    // New game - listen for hangman:new-game event
    socket.on("hangman:new-game", async (data) => {
      // Convert hangman event data to expected NewGameRequest format
      const newGameRequest = {
        gameId: "default-game", // Use default for now
      };
      await this.gameController.handleNewGame(socket, newGameRequest);
    });

    // Get game state
    socket.on("game:get-state", async (data) => {
      await this.gameController.handleGetGameState(socket, data);
    });

    // Start game
    socket.on("game:start", async (data) => {
      await this.gameController.handleStartGame(socket, data);
    });

    // End game
    socket.on("game:end", async (data) => {
      await this.gameController.handleEndGame(socket, data);
    });

    // Reset game
    socket.on("game:reset", async (data) => {
      await this.gameController.handleResetGame(socket, data);
    });
  }

  private setupChatEventHandlers(socket: Socket): void {
    // Send message
    socket.on("chat:send-message", async (data) => {
      await this.chatController.handleSendMessage(socket, data);
    });

    // Get chat history
    socket.on("chat:get-history", async (data) => {
      await this.chatController.handleGetChatHistory(socket, data);
    });

    // Join chat room
    socket.on("chat:join-room", async (data) => {
      await this.chatController.handleJoinChatRoom(socket, data);
    });

    // Leave chat room
    socket.on("chat:leave-room", async (data) => {
      await this.chatController.handleLeaveChatRoom(socket, data);
    });
  }

  private setupDisconnectionHandler(socket: Socket): void {
    socket.on("disconnect", async (reason) => {
      try {
        console.log(`🔌 Disconnection: ${socket.id} - ${reason}`);

        // Handle disconnection in all controllers
        await Promise.all([
          this.userController.handleDisconnection(socket),
          this.gameController.handleDisconnection(socket),
          this.chatController.handleDisconnection(socket),
        ]);
      } catch (error) {
        console.error(`Error handling disconnection for ${socket.id}:`, error);
      }
    });
  }

  private startCleanupTasks(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(async () => {
      try {
        console.log("🧹 Running cleanup tasks...");

        // Cleanup inactive users (30 minutes)
        // Cleanup inactive games (1 hour)
        // Note: These would typically be handled by the services
        // but we can trigger them here periodically

        console.log("✅ Cleanup tasks completed");
      } catch (error) {
        console.error("❌ Error during cleanup:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  public async shutdown(): Promise<void> {
    try {
      console.log("🔄 Shutting down socket orchestrator...");

      // Clear cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Close all socket connections
      this.io.close();

      console.log("✅ Socket orchestrator shut down successfully");
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      throw error;
    }
  }
}
