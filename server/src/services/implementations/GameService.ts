// Game service implementation
import { IGameService } from "../interfaces/IGameService";
import {
  Game,
  GameState,
  GameStatus,
  User,
  PlayerInfo,
  Result,
  AsyncResult,
  createSuccess,
  createError,
} from "../../../../shared/types";
import {
  ApplicationError,
  createValidationError,
  createNotFoundError,
  createConflictError,
} from "../../../../shared/errors";

interface GameSession {
  game: Game;
  lastActivity: Date;
  maxPlayers: number;
}

export class GameService implements IGameService {
  private games = new Map<string, GameSession>();
  private readonly DEFAULT_MAX_PLAYERS = 10;
  private readonly WORDS = [
    "javascript",
    "typescript",
    "programming",
    "computer",
    "algorithm",
    "function",
    "variable",
    "object",
    "array",
    "string",
    "boolean",
    "interface",
    "class",
    "method",
    "property",
    "framework",
    "library",
    "database",
    "server",
    "client",
    "socket",
    "websocket",
    "hangman",
  ];

  async createGame(gameId: string, createdBy: string): AsyncResult<Game> {
    try {
      if (!gameId?.trim()) {
        return createError(createValidationError("Game ID is required"));
      }

      if (!createdBy?.trim()) {
        return createError(createValidationError("Creator ID is required"));
      }

      if (this.games.has(gameId)) {
        return createError(createConflictError("Game", gameId));
      }

      const word = this.getRandomWord();
      const now = Date.now();

      const game: Game = {
        id: gameId,
        players: [],
        state: {
          word: word,
          currentWord: word,
          correctGuesses: [],
          incorrectGuesses: [],
          guessedLetters: [],
          remainingGuesses: 6,
          maxGuesses: 6,
          maxIncorrectGuesses: 6,
          status: "waiting",
          displayWord: "_".repeat(word.length),
        },
        createdAt: now,
        updatedAt: now,
        createdBy,
        options: {
          maxPlayers: this.DEFAULT_MAX_PLAYERS,
          timeLimit: 0, // No time limit by default
          difficulty: "medium",
        },
        name: "",
        status: "waiting",
        maxPlayers: 0,
      };

      const session: GameSession = {
        game,
        lastActivity: new Date(),
        maxPlayers: this.DEFAULT_MAX_PLAYERS,
      };

      this.games.set(gameId, session);
      console.log(`Game created: ${gameId} by ${createdBy}`);

      return createSuccess(game);
    } catch (error) {
      console.error("Error creating game:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to create game")
      );
    }
  }

  async getGame(gameId: string): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }
      return createSuccess(session.game);
    } catch (error) {
      console.error("Error getting game:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get game")
      );
    }
  }

  async addPlayerToGame(gameId: string, user: User): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      const { game } = session;

      // Check if player already in game
      if (game.players.some((p) => p.id === user.id)) {
        return createSuccess(game); // Player already in game
      }

      // Check if game is full
      if (game.players.length >= session.maxPlayers) {
        return createError(createValidationError("Game is full"));
      }

      // Check if game is in progress and doesn't allow new players
      if (game.state.status === "playing" && game.players.length > 0) {
        return createError(
          createValidationError("Cannot join game in progress")
        );
      } // Add player - convert User to PlayerInfo
      const playerInfo: PlayerInfo = {
        id: user.id,
        name: user.nickname,
        joinedAt: Date.now(),
        isActive: true,
        avatar: user.avatar,
      };
      game.players.push(playerInfo);
      game.updatedAt = Date.now();
      session.lastActivity = new Date();

      console.log(`Player ${user.nickname} joined game ${gameId}`);
      return createSuccess(game);
    } catch (error) {
      console.error("Error adding player to game:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to add player to game")
      );
    }
  }

  async removePlayerFromGame(
    gameId: string,
    userId: string
  ): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      const { game } = session;
      const playerIndex = game.players.findIndex((p) => p.id === userId);

      if (playerIndex === -1) {
        return createError(createNotFoundError("Player in game", userId));
      }

      const removedPlayer = game.players[playerIndex];
      game.players.splice(playerIndex, 1);
      game.updatedAt = Date.now();
      session.lastActivity = new Date();

      // If no players left, reset game
      if (game.players.length === 0) {
        game.state.status = "waiting";
      }

      console.log(`Player ${removedPlayer.name} left game ${gameId}`);
      return createSuccess(game);
    } catch (error) {
      console.error("Error removing player from game:", error);
      return createError(
        new ApplicationError(
          "INTERNAL_ERROR",
          "Failed to remove player from game"
        )
      );
    }
  }

  async startGame(gameId: string): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      const { game } = session;
      if (game.players.length === 0) {
        return createError(
          createValidationError("Cannot start game with no players")
        );
      }

      // Allow restarting games in any state
      // if (game.state.status === "playing") {
      //   return createError(
      //     createValidationError("Game is already in progress")
      //   );
      // }// Reset game state
      const word = this.getRandomWord();
      game.state = {
        word: word,
        currentWord: word,
        correctGuesses: [],
        incorrectGuesses: [],
        guessedLetters: [],
        remainingGuesses: 6,
        maxGuesses: 6,
        maxIncorrectGuesses: 6,
        status: "playing",
        displayWord: "_".repeat(word.length),
      };

      game.updatedAt = Date.now();
      session.lastActivity = new Date();

      console.log(`Game ${gameId} started with word: ${word}`);
      return createSuccess(game);
    } catch (error) {
      console.error("Error starting game:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to start game")
      );
    }
  }

  async makeGuess(
    gameId: string,
    userId: string,
    letter: string
  ): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      const { game } = session;

      // Validate game state
      if (game.state.status !== "playing") {
        return createError(createValidationError("Game is not in progress"));
      }

      // Validate player
      if (!game.players.some((p) => p.id === userId)) {
        return createError(createValidationError("Player not in game"));
      }

      // Validate letter
      const normalizedLetter = letter.toLowerCase().trim();
      if (
        !normalizedLetter ||
        normalizedLetter.length !== 1 ||
        !/[a-z]/.test(normalizedLetter)
      ) {
        return createError(createValidationError("Invalid letter"));
      }

      if (game.state.guessedLetters.includes(normalizedLetter)) {
        return createError(createValidationError("Letter already guessed"));
      }

      // Make guess
      game.state.guessedLetters.push(normalizedLetter);
      if (game.state.currentWord.includes(normalizedLetter)) {
        // Correct guess - update display word
        game.state.correctGuesses.push(normalizedLetter);
        game.state.displayWord = game.state.currentWord
          .split("")
          .map((char: string) =>
            game.state.guessedLetters.includes(char) ? char : "_"
          )
          .join("");
      } else {
        // Incorrect guess
        game.state.incorrectGuesses.push(normalizedLetter);
        game.state.remainingGuesses--;
      }

      // Check win condition
      if (!game.state.displayWord.includes("_")) {
        game.state.status = "won";
      }
      // Check lose condition
      else if (
        game.state.incorrectGuesses.length >= game.state.maxIncorrectGuesses
      ) {
        game.state.status = "lost";
        game.state.displayWord = game.state.currentWord; // Reveal word
      }

      game.updatedAt = Date.now();
      session.lastActivity = new Date();

      return createSuccess(game);
    } catch (error) {
      console.error("Error making guess:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to make guess")
      );
    }
  }

  async getGameState(gameId: string): AsyncResult<GameState> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }
      return createSuccess(session.game.state);
    } catch (error) {
      console.error("Error getting game state:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get game state")
      );
    }
  }

  async endGame(gameId: string): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      const { game } = session;
      game.state.status = "waiting";
      game.updatedAt = Date.now();
      session.lastActivity = new Date();

      return createSuccess(game);
    } catch (error) {
      console.error("Error ending game:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to end game")
      );
    }
  }

  async resetGame(gameId: string): AsyncResult<Game> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      const { game } = session;
      const word = this.getRandomWord();
      game.state = {
        word: word,
        currentWord: word,
        correctGuesses: [],
        incorrectGuesses: [],
        guessedLetters: [],
        remainingGuesses: 6,
        maxGuesses: 6,
        maxIncorrectGuesses: 6,
        status: "waiting",
        displayWord: "_".repeat(word.length),
      };

      game.updatedAt = Date.now();
      session.lastActivity = new Date();

      return createSuccess(game);
    } catch (error) {
      console.error("Error resetting game:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to reset game")
      );
    }
  }

  async getAllGames(): AsyncResult<Game[]> {
    try {
      const games = Array.from(this.games.values()).map(
        (session) => session.game
      );
      return createSuccess(games);
    } catch (error) {
      console.error("Error getting all games:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get games")
      );
    }
  }

  async gameExists(gameId: string): Promise<boolean> {
    return this.games.has(gameId);
  }

  async updateGameActivity(gameId: string): AsyncResult<void> {
    try {
      const session = this.games.get(gameId);
      if (!session) {
        return createError(createNotFoundError("Game", gameId));
      }

      session.lastActivity = new Date();
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error updating game activity:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to update game activity")
      );
    }
  }

  async cleanupInactiveGames(maxInactiveTime: number): AsyncResult<string[]> {
    try {
      const now = new Date();
      const removedGames: string[] = [];

      for (const [gameId, session] of this.games.entries()) {
        const inactiveTime = now.getTime() - session.lastActivity.getTime();
        if (inactiveTime > maxInactiveTime) {
          this.games.delete(gameId);
          removedGames.push(gameId);
        }
      }

      if (removedGames.length > 0) {
        console.log(`Cleaned up ${removedGames.length} inactive games`);
      }

      return createSuccess(removedGames);
    } catch (error) {
      console.error("Error cleaning up inactive games:", error);
      return createError(
        new ApplicationError(
          "INTERNAL_ERROR",
          "Failed to cleanup inactive games"
        )
      );
    }
  }

  private getRandomWord(): string {
    return this.WORDS[Math.floor(Math.random() * this.WORDS.length)];
  }
}
