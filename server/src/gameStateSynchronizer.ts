import { Socket } from "socket.io";
import {
  GameStatus,
  GameStateEvent,
  PlayerInfo,
  GameAction, // ✅ Use only shared types
} from "../../shared/types";
import { MultiplayerHangmanGame } from "./MultiplayerHangmanGame";
import { UserManager } from "./userManager"; // Import UserManager

export class GameStateSynchronizer {
  private static userManager = new UserManager(); // Integrate UserManager

  /**
   * Synchronizes game state to a newly joined player
   */
  static syncNewPlayer(socket: Socket, game: MultiplayerHangmanGame): void {
    const gameState = game.getGameState();
    const syncData = this.prepareSyncData(gameState, game);

    // Send comprehensive sync data to new player
    socket.emit("hangman:game-state", {
      ...syncData,
      isJoining: true,
      welcomeMessage: this.getWelcomeMessage(gameState.status),
    });

    // Notify other players about the new player
    socket.to(game.getGameId()).emit("hangman:player-joined", {
      playerId: socket.id,
      playerCount: game.getPlayerCount(),
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcasts game state updates to all players in the session
   */
  static broadcastGameUpdate(
    io: any,
    gameId: string,
    game: MultiplayerHangmanGame,
    excludeSocketId?: string
  ): void {
    const gameState = game.getGameState();
    const updateData = this.prepareSyncData(gameState, game);

    const broadcast = excludeSocketId
      ? io.to(gameId).except(excludeSocketId)
      : io.to(gameId);

    broadcast.emit("hangman:game-state", updateData);
  }

  /**
   * Enhanced sync data preparation
   */
  static prepareSyncData(
    gameState: any, // Use proper GameState type from shared
    game: MultiplayerHangmanGame
  ): GameStateEvent {
    return {
      word: gameState.word,
      correctGuesses: gameState.correctGuesses,
      incorrectGuesses: gameState.incorrectGuesses,
      remainingGuesses: gameState.remainingGuesses,
      maxGuesses: gameState.maxGuesses,
      status: gameState.status,
      displayWord: gameState.displayWord,
      players: this.getActivePlayers(game),
      lastAction: this.enrichLastAction(game.getLastAction(), game),
      guessedLetters: [
        ...gameState.correctGuesses,
        ...gameState.incorrectGuesses,
      ],
    };
  }

  /**
   * Enriches the last action with player name data
   */
  private static enrichLastAction(
    action: any,
    game: MultiplayerHangmanGame
  ): GameAction | undefined {
    if (!action) return undefined;

    const user = this.userManager.getUserBySocketId(action.playerId);
    const playerName = user?.nickname || `Player ${action.playerId.slice(-4)}`;

    return {
      ...action,
      playerName,
    };
  }

  /**
   * Gets a summary of active players for game state
   */
  private static getActivePlayers(game: MultiplayerHangmanGame): PlayerInfo[] {
    return Array.from(game.getPlayers()).map((playerId) => {
      // ✅ Get real user data instead of placeholder
      const user = this.userManager.getUserBySocketId(playerId);

      return {
        id: playerId,
        name: user?.nickname || `Player ${playerId.slice(-4)}`, // Real nickname
        joinedAt: user?.joinedAt || Date.now(),
        isActive: true,
        avatar: user?.avatar,
      };
    });
  }

  /**
   * Creates a game summary for display purposes
   */
  static getGameSummary(game: MultiplayerHangmanGame): {
    gameId: string;
    playerCount: number;
    status: string;
    word?: string;
    isComplete: boolean;
  } {
    const gameState = game.getGameState();

    return {
      gameId: game.getGameId(),
      playerCount: game.getPlayerCount(),
      status: gameState.status,
      word: gameState.status !== "playing" ? gameState.word : undefined,
      isComplete: gameState.status === "won" || gameState.status === "lost",
    };
  }

  /**
   * Handles player disconnection and cleanup
   */
  static handlePlayerDisconnect(
    socket: Socket,
    game: MultiplayerHangmanGame,
    io: any
  ): void {
    const wasRemoved = game.removePlayer(socket.id);

    if (wasRemoved) {
      // Notify remaining players
      socket.to(game.getGameId()).emit("hangman:player-left", {
        playerId: socket.id,
        playerCount: game.getPlayerCount(),
        timestamp: Date.now(),
      });

      // If no players left, could trigger game cleanup
      if (game.getPlayerCount() === 0) {
        console.log(`Game ${game.getGameId()} has no active players`);
      }
    }
  }

  /**
   * Get welcome message based on game status
   */
  private static getWelcomeMessage(status: GameStatus): string {
    switch (status) {
      case "won":
        return "Game completed! Someone already won this round.";
      case "lost":
        return "Game over! The word was not guessed in time.";
      case "playing":
        return "Game in progress! Join in and start guessing!";
      default:
        return "Welcome to Hang Guy!";
    }
  }
}

// Add missing chat types
export interface ChatMessage {
  id: string;
  userId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: "chat" | "system" | "game";
}

// Add to ClientToServerEvents
export interface ClientToServerEvents {
  // ...existing events...
  "chat:send-message": (data: { message: string }) => void;
}

// Add to ServerToClientEvents
export interface ServerToClientEvents {
  // ...existing events...
  "chat:message-received": (message: ChatMessage) => void;
  "chat:system-message": (message: string) => void;
}
