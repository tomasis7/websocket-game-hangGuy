import { Socket } from "socket.io";
import { GameStatus, GameStateEvent, PlayerInfo } from "../../shared/types";
import {
  GameAction,
  GameState,
  MultiplayerHangmanGame,
} from "./MultiplayerHangmanGame";
import { UserManager } from "./userManager";

export class GameStateSynchronizer {
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
    gameState: GameState,
    game: MultiplayerHangmanGame
  ): GameStateEvent & {
    players: PlayerInfo[];
    lastAction?: GameAction;
  } {
    return {
      word: gameState.word,
      correctGuesses: gameState.correctGuesses,
      incorrectGuesses: gameState.incorrectGuesses,
      remainingGuesses: gameState.remainingGuesses,
      maxGuesses: gameState.maxGuesses,
      status: gameState.status,
      displayWord: gameState.displayWord,
      players: this.getActivePlayers(game),
      lastAction: game.getLastAction(),
      guessedLetters: [
        ...gameState.correctGuesses,
        ...gameState.incorrectGuesses,
      ],
    };
  }

  /**
   * Gets a summary of active players for game state
   */
  private static getActivePlayers(game: MultiplayerHangmanGame): PlayerInfo[] {
    return Array.from(game.getPlayers()).map((playerId) => ({
      id: playerId,
      name: `Player ${playerId.slice(-4)}`, // Use last 4 chars as display name
      joinedAt: Date.now(), // This should come from actual player data
      isActive: true,
    }));
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

export class SocketHandlers {
  private userManager = new UserManager();
  // Fix: Remove any type and properly initialize
  private gameStateSynchronizer = GameStateSynchronizer; // Static class

  // Fix the usage in setupHandlers:
  // Current: const gameSummary = this.gameStateSynchronizer.getGameSummary(); ❌
  // Should be: const gameSummary = GameStateSynchronizer.getGameSummary(hangmanGame); ✅
}
