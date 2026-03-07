import { GameManager } from './gameManager';
import { Socket } from 'socket.io';
import { GameStateEvent, PlayerInfo } from '../../shared/types';

export interface JoinGameResponse {
  success: boolean;
  gameState?: GameStateEvent;
  playerInfo?: PlayerInfo;
  error?: string;
  isGameInProgress: boolean;
  syncData?: {
    wordLength: number;
    revealedLetters: string[];
    hangmanStage: number;
    gameProgress: number; // percentage of game completion
  };
}

export class GameStateSynchronizer {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  /**
   * Handle new player joining an ongoing game
   */
  async handlePlayerJoin(socket: Socket, playerName: string): Promise<JoinGameResponse> {
    const playerId = socket.id;

    try {
      // Check if game is in progress
      const currentGameState = this.gameManager.getGameState();
      const isGameInProgress = currentGameState.status === 'playing';

      // Add player to game
      const playerInfo = this.gameManager.addPlayer(playerId, playerName);

      // Prepare sync data for new player
      const syncData = this.prepareSyncData(currentGameState);

      // Join the socket room
      socket.join('hangman-room');

      console.log(`Player ${playerName} joined ${isGameInProgress ? 'ongoing' : 'inactive'} game`);

      return {
        success: true,
        gameState: currentGameState,
        playerInfo,
        isGameInProgress,
        syncData
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
   * Prepare synchronization data for new players
   */
  private prepareSyncData(gameState: GameStateEvent) {
    const wordLength = gameState.displayWord.replace(/\s/g, '').length;
    const revealedLetters = gameState.correctGuesses;
    const hangmanStage = gameState.incorrectGuesses.length;
    const totalGuesses = gameState.guessedLetters.length;
    const maxPossibleGuesses = 26;
    const gameProgress = Math.round((totalGuesses / maxPossibleGuesses) * 100);

    return {
      wordLength,
      revealedLetters,
      hangmanStage,
      gameProgress
    };
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