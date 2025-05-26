/**
 * Barrel export file for all shared types
 * This provides a single entry point for importing types throughout the application
 */

import { ApplicationError } from "../errors";

// Core types
export type {
  User,
  SessionInfo,
  UserIdentification,
  PlayerInfo,
  SavedSessionData,
  AppConfig,
  ErrorCode,
} from "./core";

// Re-export ApplicationError as AppError for convenience
export { ApplicationError };
export type AppError = ApplicationError;

// Game types
export type {
  Game,
  GameState,
  GameStatus,
  GameDifficulty,
  GameStateEvent,
  GameAction,
  GuessResult,
  WordCategory,
  GameOptions,
  GameSummary,
  GameStats,
  PlayerStats,
} from "./game";

// Socket types
export type {
  ChatMessage,
  StoredChatMessage,
  JoinGameRequest,
  JoinGameResponse,
  ReconnectRequest,
  ReconnectResponse,
  GuessLetterRequest,
  NewGameRequest,
  ClientToServerEvents,
  ServerToClientEvents,
  GameBroadcast,
  GuessEvent,
  SocketEventName,
} from "./socket";

/**
 * Utility types for common patterns
 */

// Result type utilities
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

export type Optional<T> = T | null | undefined;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Event listener types for type-safe event handling
 */
export type EventListener<T = any> = (data: T) => void;
export type EventMap = Record<string, EventListener>;

/**
 * Validation types
 */
export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationSchema<T = any> {
  [key: string]: ValidationRule<T[keyof T]>[];
}

/**
 * Utility functions for creating Results
 */
export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

export function createError<E extends AppError>(error: E): Result<never, E> {
  return { success: false, error };
}
