import { describe, it, expect, beforeEach } from 'vitest';
import { GameManager } from './gameManager';

describe('GameManager', () => {
  let gameManager: GameManager;

  beforeEach(() => {
    gameManager = new GameManager('test-game');
  });

  describe('player management', () => {
    it('should add a player successfully', () => {
      const player = gameManager.addPlayer('player1', 'TestPlayer');
      
      expect(player.id).toBe('player1');
      expect(player.name).toBe('TestPlayer');
      expect(player.isActive).toBe(true);
      expect(gameManager.getPlayerCount()).toBe(1);
    });

    it('should remove a player successfully', () => {
      gameManager.addPlayer('player1', 'TestPlayer');
      const result = gameManager.removePlayer('player1');
      
      expect(result.removed).toBe(true);
      expect(result.playerInfo?.name).toBe('TestPlayer');
      expect(gameManager.getPlayerCount()).toBe(0);
    });

    it('should return false when removing non-existent player', () => {
      const result = gameManager.removePlayer('nonexistent');
      
      expect(result.removed).toBe(false);
      expect(result.playerInfo).toBeUndefined();
    });

    it('should get all players', () => {
      gameManager.addPlayer('player1', 'Player1');
      gameManager.addPlayer('player2', 'Player2');
      
      const players = gameManager.getPlayers();
      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('Player1');
      expect(players[1].name).toBe('Player2');
    });
  });

  describe('game state management', () => {
    it('should start a new game', () => {
      const gameState = gameManager.startNewGame();
      
      expect(gameState.status).toBe('playing');
      expect(gameState.remainingGuesses).toBe(8);
      // Word is hidden during active play (security)
      expect(gameState.word).toBe('');
      expect(gameState.displayWord).toBeDefined();
      expect(gameState.displayWord.length).toBeGreaterThan(0);
    });

    it('should process valid guess', () => {
      gameManager.addPlayer('player1', 'TestPlayer');
      
      const result = gameManager.processGuess('A', 'player1');
      
      expect(result.success).toBe(true);
      expect(typeof result.isCorrect).toBe('boolean');
      expect(result.gameState).toBeDefined();
      expect(result.gameState.guessedLetters).toContain('A');
    });

    it('should reject guess from non-existent player', () => {
      const result = gameManager.processGuess('A', 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player not found in game');
    });

    it('should return current game state', () => {
      gameManager.addPlayer('player1', 'TestPlayer');
      const gameState = gameManager.getGameState();
      
      expect(gameState.word).toBeDefined();
      expect(gameState.status).toBe('playing');
      expect(gameState.players).toHaveLength(1);
      expect(gameState.players[0].name).toBe('TestPlayer');
    });
  });

  describe('game statistics', () => {
    it('should provide game statistics', () => {
      gameManager.addPlayer('player1', 'TestPlayer');
      const stats = gameManager.getGameStats();
      
      expect(stats.gameId).toBe('test-game');
      expect(stats.playerCount).toBe(1);
      expect(stats.gameStatus).toBe('playing');
      expect(typeof stats.totalGuesses).toBe('number');
    });
  });

  describe('turn management', () => {
    it('gives the first turn to the first player who joined', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('reports no current player when the game is empty', () => {
      expect(gameManager.getGameState().currentPlayer).toBeUndefined();
    });

    it('advances the turn after every successful guess and wraps around', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      const first = gameManager.processGuess('A', 'p1');
      expect(first.success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p2');

      const second = gameManager.processGuess('B', 'p2');
      expect(second.success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('rejects an out-of-turn guess with NOT_YOUR_TURN and does not advance', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      const result = gameManager.processGuess('A', 'p2');

      expect(result.success).toBe(false);
      expect(result.error).toBe("It's not your turn");
      expect(result.errorCode).toBe('NOT_YOUR_TURN');
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
      expect(gameManager.getGameState().guessedLetters).not.toContain('A');
    });

    it('does not advance the turn on an invalid guess (duplicate letter)', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.processGuess('A', 'p1'); // turn -> p2

      const dup = gameManager.processGuess('A', 'p2');

      expect(dup.success).toBe(false);
      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('passes the turn to the next player when the current player leaves', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p3', 'Cara');

      gameManager.removePlayer('p1');

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('wraps the turn to the first player when the last player leaves mid-turn', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.processGuess('A', 'p1'); // turn -> p2 (last in order)

      gameManager.removePlayer('p2');

      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('keeps the turn on the current player when an earlier player leaves', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p3', 'Cara');
      gameManager.processGuess('A', 'p1'); // turn -> p2

      gameManager.removePlayer('p1');

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('resets the turn to the first player in join order on new game', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.processGuess('A', 'p1'); // turn -> p2

      gameManager.startNewGame();

      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('always lets a solo player guess', () => {
      gameManager.addPlayer('p1', 'Alice');

      const result = gameManager.processGuess('A', 'p1');

      expect(result.success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('does not duplicate a player in the turn order on re-join', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p1', 'Alice'); // reconnection re-add, same id

      gameManager.processGuess('A', 'p1'); // turn -> p2, not p1 again

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });
  });
});