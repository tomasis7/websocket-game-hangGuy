import { GameManager } from './gameManager';
import { Socket } from 'socket.io';
import { GameStateEvent, PlayerInfo } from '../../shared/types.ts';
import { HANGMAN_ROOM } from '../../shared/multiplayer.ts';

// Discriminated on `success` so callers that check it are statically guaranteed
// the game state / player info (on success) or the error message (on failure),
// without resorting to non-null assertions.
export type JoinGameResponse =
  | {
      success: true;
      gameState: GameStateEvent;
      playerInfo: PlayerInfo;
      isGameInProgress: boolean;
    }
  | {
      success: false;
      error: string;
      isGameInProgress: boolean;
    };

export class GameStateSynchronizer {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  /**
   * Handle new player joining an ongoing game
   */
  handlePlayerJoin(socket: Socket, playerName: string): JoinGameResponse {
    const playerId = socket.id;

    try {
      // Check if game is in progress
      const currentGameState = this.gameManager.getGameState();
      const isGameInProgress = currentGameState.status === 'playing';

      // Add player to game
      const playerInfo = this.gameManager.addPlayer(playerId, playerName);

      // Join the socket room
      socket.join(HANGMAN_ROOM);

      console.log(`Player ${playerName} joined ${isGameInProgress ? 'ongoing' : 'inactive'} game`);

      // Re-fetch state after adding the player so joiners (and the joined
      // broadcast) see fresh turn/roster data instead of the pre-join snapshot.
      const updatedGameState = this.gameManager.getGameState();

      return {
        success: true,
        gameState: updatedGameState,
        playerInfo,
        isGameInProgress,
      };

    } catch (error) {
      console.error('Error handling player join:', error);
      return {
        success: false,
        error: 'Failed to join game',
        isGameInProgress: false
      };
    }
  }

  /**
   * Get game summary for new players
   */
  getGameSummary(gameState: GameStateEvent): string {
    if (gameState.status === 'playing') {
      const correctCount = gameState.correctGuesses.length;
      const incorrectCount = gameState.incorrectGuesses.length;
      const displayChars = gameState.displayWord.replace(/\s/g, '');
      const wordLength = displayChars.length;
      const revealedCount = displayChars.replace(/_/g, '').length;

      return `Game in progress: ${revealedCount}/${wordLength} letters revealed, ${correctCount} correct guesses, ${incorrectCount} incorrect guesses`;
    } else if (gameState.status === 'won') {
      return `Game completed: The word was guessed successfully!`;
    } else if (gameState.status === 'lost') {
      return `Game over: The word was "${gameState.word}".`;
    }
    
    return 'No active game';
  }
}