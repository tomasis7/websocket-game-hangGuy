// Service interface for game management operations
import {
  Game,
  GameState,
  GameStatus,
  User,
  Result,
  AsyncResult,
} from "../../../../shared/types";

export interface IGameService {
  /**
   * Create a new game session
   */
  createGame(gameId: string, createdBy: string): AsyncResult<Game>;

  /**
   * Get game by ID
   */
  getGame(gameId: string): AsyncResult<Game>;

  /**
   * Add a player to a game
   */
  addPlayerToGame(gameId: string, user: User): AsyncResult<Game>;

  /**
   * Remove a player from a game
   */
  removePlayerFromGame(gameId: string, userId: string): AsyncResult<Game>;

  /**
   * Start a game
   */
  startGame(gameId: string): AsyncResult<Game>;

  /**
   * Make a guess in the game
   */
  makeGuess(gameId: string, userId: string, letter: string): AsyncResult<Game>;

  /**
   * Get current game state
   */
  getGameState(gameId: string): AsyncResult<GameState>;

  /**
   * End a game
   */
  endGame(gameId: string): AsyncResult<Game>;

  /**
   * Reset game to initial state
   */
  resetGame(gameId: string): AsyncResult<Game>;

  /**
   * Get all active games
   */
  getAllGames(): AsyncResult<Game[]>;

  /**
   * Check if game exists
   */
  gameExists(gameId: string): Promise<boolean>;

  /**
   * Update game activity
   */
  updateGameActivity(gameId: string): AsyncResult<void>;

  /**
   * Clean up inactive games
   */
  cleanupInactiveGames(maxInactiveTime: number): AsyncResult<string[]>;
}
