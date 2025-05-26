/**
 * Game-specific types for the multiplayer Hangman game
 */

import type { PlayerInfo } from "./core";

export type GameStatus = "waiting" | "playing" | "won" | "lost" | "paused";
export type GameDifficulty = "easy" | "medium" | "hard";

export interface GameStateEvent {
  word: string;
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  status: GameStatus;
  displayWord: string;
  players: PlayerInfo[];
  lastAction?: GameAction;
  guessedLetters: string[];
  currentPlayerId?: string;
  gameId: string;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
}

export interface GameAction {
  type: "player_join" | "player_leave" | "guess" | "new_game" | "game_end";
  playerId: string;
  playerName: string;
  timestamp: number;
  data?: {
    letter?: string;
    isCorrect?: boolean;
    gameStatus?: GameStatus;
    word?: string;
  };
}

export interface GuessResult {
  letter: string;
  isCorrect: boolean;
  isGameOver: boolean;
  gameStatus: GameStatus;
  alreadyGuessed: boolean;
  wordRevealed?: string;
  gameState: GameStateEvent;
}

export interface WordCategory {
  name: string;
  words: string[];
  difficulty: GameDifficulty;
}

export interface GameOptions {
  category?: string;
  difficulty?: GameDifficulty;
  maxGuesses?: number;
  timeLimit?: number;
  maxPlayers?: number;
}

export interface GameSummary {
  gameId: string;
  playerCount: number;
  status: GameStatus;
  word?: string;
  isComplete: boolean;
  duration: number;
  winner?: string;
}

/**
 * Game statistics and metrics
 */
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  averageGuesses: number;
  bestTime: number;
  totalPlayTime: number;
}

/**
 * Core game entity representing a multiplayer game instance
 */
export interface Game {
  id: string;
  name: string;
  status: GameStatus;
  players: PlayerInfo[];
  maxPlayers: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  state: GameState;
  options: GameOptions;
}

/**
 * Current state of a game instance
 */
export interface GameState {
  word: string;
  correctGuesses: string[];
  incorrectGuesses: string[];
  guessedLetters: string[];
  remainingGuesses: number;
  maxGuesses: number;
  status: GameStatus;
  currentPlayerId?: string;
  lastAction?: GameAction;
  // Additional properties used by the game service
  currentWord: string;
  displayWord: string;
  maxIncorrectGuesses: number;
}

export interface PlayerStats extends GameStats {
  playerId: string;
  playerName: string;
  joinDate: number;
  lastActive: number;
}
