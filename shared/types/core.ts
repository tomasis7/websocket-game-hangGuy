/**
 * Core entity types for the multiplayer Hangman game
 * These are the fundamental building blocks used throughout the application
 */

export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  isActive: boolean;
  joinedAt: number;
}

export interface SessionInfo {
  id: string;
  hostUserId: string;
  createdAt: number;
  playerCount: number;
}

export interface UserIdentification {
  userId: string;
  nickname: string;
  sessionId: string;
  isHost: boolean;
}

export interface PlayerInfo {
  id: string;
  name: string;
  joinedAt: number;
  isActive: boolean;
  avatar?: string;
}

export interface SavedSessionData {
  userId: string;
  sessionId: string;
  nickname: string;
}

/**
 * Application configuration interfaces
 */
export interface AppConfig {
  environment: string;
  server: {
    port: number;
    host: string;
    logLevel: string;
  };
  client: {
    apiUrl: string;
    socketUrl: string;
    url: string;
  };
  game: {
    maxPlayers: number;
    sessionTimeout: number;
    maxGuesses: number;
  };
}

/**
 * Error types for consistent error handling
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export type ErrorCode =
  | "INVALID_INPUT"
  | "USER_NOT_FOUND"
  | "SESSION_NOT_FOUND"
  | "GAME_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "CONNECTION_ERROR"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";
