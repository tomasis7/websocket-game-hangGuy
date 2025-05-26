/**
 * Legacy shared types file - now re-exports from organized type modules
 * @deprecated Use individual type imports from shared/types/ instead
 */

// Re-export all types from the new organized structure
export * from "./types/index";

// Keep legacy exports for backward compatibility during transition
import type {
  User as _User,
  SessionInfo as _SessionInfo,
  JoinGameRequest as _JoinGameRequest,
  JoinGameResponse as _JoinGameResponse,
  ReconnectResponse as _ReconnectResponse,
  UserIdentification as _UserIdentification,
  GameStateEvent as _GameStateEvent,
  GuessLetterRequest as _GuessLetterRequest,
  NewGameRequest as _NewGameRequest,
  ClientToServerEvents as _ClientToServerEvents,
  ServerToClientEvents as _ServerToClientEvents,
  PlayerInfo as _PlayerInfo,
  GameAction as _GameAction,
  GuessResult as _GuessResult,
  WordCategory as _WordCategory,
  GameStatus as _GameStatus,
  ChatMessage as _ChatMessage,
} from "./types/index";

// Legacy type aliases for backward compatibility
export type User = _User;
export type SessionInfo = _SessionInfo;
export type JoinGameRequest = _JoinGameRequest;
export type JoinGameResponse = _JoinGameResponse;
export type ReconnectResponse = _ReconnectResponse;
export type UserIdentification = _UserIdentification;
export type GameStateEvent = _GameStateEvent;
export type GuessLetterRequest = _GuessLetterRequest;
export type NewGameRequest = _NewGameRequest;
export type ClientToServerEvents = _ClientToServerEvents;
export type ServerToClientEvents = _ServerToClientEvents;
export type PlayerInfo = _PlayerInfo;
export type GameAction = _GameAction;
export type GuessResult = _GuessResult;
export type WordCategory = _WordCategory;
export type GameStatus = _GameStatus;
export type ChatMessage = _ChatMessage;

// Legacy interface for error responses
export interface HangmanErrorResponse {
  message: string;
  code: string;
}
