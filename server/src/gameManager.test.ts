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
      expect(gameState.word).toBeDefined();
      expect(gameState.word.length).toBeGreaterThan(0);
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
});