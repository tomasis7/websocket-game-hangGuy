/**
 * Socket.IO event definitions for type-safe communication
 * between client and server
 */

import type {
  User,
  UserIdentification,
  SessionInfo,
  PlayerInfo,
  AppError,
} from "./core";
import type {
  GameStateEvent,
  GameAction,
  GuessResult,
  GameOptions,
  GameSummary,
} from "./game";

/**
 * Chat message types
 */
export interface ChatMessage {
  id: string;
  userId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: "chat" | "system" | "game";
}

/**
 * Stored chat message with user information
 */
export interface StoredChatMessage {
  id: string;
  userId: string;
  user: User;
  message: string;
  timestamp: number;
  type: "chat" | "system" | "game";
  roomId: string;
}

/**
 * Request/Response types for API communication
 */
export interface JoinGameRequest {
  gameId: string;
  nickname: string;
  sessionId?: string;
  avatar?: string;
}

export interface JoinGameResponse {
  success: boolean;
  user?: User;
  session?: SessionInfo;
  gameState?: GameStateEvent;
  error?: string;
}

export interface ReconnectRequest {
  userId: string;
  sessionId: string;
  nickname: string;
}

export interface ReconnectResponse {
  success: boolean;
  user?: User;
  session?: SessionInfo;
  gameState?: GameStateEvent;
  error?: string;
}

export interface GuessLetterRequest {
  gameId: string;
  letter: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface NewGameRequest {
  gameId: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  maxGuesses?: number;
}

/**
 * Client to Server Events
 */
export interface ClientToServerEvents {
  // User management
  joinGame: (request: JoinGameRequest & { userId?: string }) => void;
  leaveGame: (data: { userId: string }) => void;
  reconnectToSession: (data: ReconnectRequest) => void;
  getUserList: () => void;

  // Game events
  "hangman:join-game": (data: {
    playerName: string;
    sessionId?: string;
    avatar?: string;
  }) => void;
  "hangman:leave-game": (data: { userId: string }) => void;
  "hangman:guess-letter": (data: GuessLetterRequest) => void;
  "hangman:new-game": (data?: NewGameRequest) => void;
  "hangman:request-sync": () => void;

  // Chat events
  "chat:send-message": (data: { message: string }) => void;
}

/**
 * Server to Client Events
 */
export interface ServerToClientEvents {
  // Connection responses
  joinGameResponse: (response: JoinGameResponse) => void;
  reconnectResponse: (response: ReconnectResponse) => void;
  error: (error: string | AppError | { message: string }) => void;
  notification: (message: string) => void;

  // User events
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userListUpdated: (users: User[]) => void;
  sessionUpdated: (session: SessionInfo) => void;

  // Game events
  "hangman:join-success": (data: {
    gameState: GameStateEvent;
    playerInfo: PlayerInfo;
    isGameInProgress: boolean;
    gameSummary: string;
    sessionId: string;
    timestamp: number;
  }) => void;

  "hangman:join-error": (error: string | AppError) => void;

  "hangman:game-state": (gameState: GameStateEvent) => void;

  "hangman:guess-result": (result: {
    letter: string;
    isCorrect: boolean;
    playerId: string;
    playerName: string;
    gameState: GameStateEvent;
    timestamp: number;
  }) => void;

  "hangman:player-action-broadcast": (data: {
    action: "joined" | "left";
    playerId: string;
    playerName: string;
    playerCount: number;
    gameState: GameStateEvent;
    isNewPlayer?: boolean;
    timestamp: number;
  }) => void;

  "hangman:game-start-broadcast": (data: {
    startedBy: string;
    startedByName: string;
    gameState: GameStateEvent;
    timestamp: number;
  }) => void;

  "hangman:game-end-broadcast": (data: {
    gameState: GameStateEvent;
    winner?: string;
    summary: GameSummary;
    timestamp: number;
  }) => void;

  "hangman:sync-response": (data: {
    gameState: GameStateEvent;
    players: PlayerInfo[];
    summary: string;
    timestamp: number;
  }) => void; // Chat events
  "chat:message": (data: { message: ChatMessage; roomId: string }) => void;
  "chat:history": (data: { messages: ChatMessage[]; roomId: string }) => void;
  "chat:user-joined": (data: { user: User; roomId: string }) => void;
  "chat:user-left": (data: {
    user: User;
    userId: string;
    roomId: string;
  }) => void;
  "chat:message-received": (message: ChatMessage) => void;
  "chat:system-message": (message: string) => void; // Game events
  "game:created": (data: { gameId: string; game: any }) => void;
  "game:join-success": (data: { gameId: string; user: User }) => void;
  "game:leave-success": (data: { gameId: string; message?: string }) => void;
  "game:player-joined": (data: {
    gameId: string;
    user: User;
    playerCount: number;
  }) => void;
  "game:player-left": (data: {
    gameId: string;
    userId: string;
    playerCount: number;
  }) => void;
  "game:state": (data: { gameId: string; gameState: any }) => void;
  "game:started": (data: { gameId: string; gameState: any }) => void;
  "game:ended": (data: {
    gameId: string;
    gameState: any;
    winner?: string;
  }) => void;
  "game:reset": (data: { gameId: string; gameState: any }) => void;
  "game:guess-made": (data: {
    gameId: string;
    result: any;
    gameState: any;
  }) => void;
  // User events
  "users:list": (data: { users: User[] }) => void;
  "users:identification-success": (data: {
    user: User;
    sessionId: string;
  }) => void;
}

/**
 * Broadcast event types for internal server communication
 */
export interface GameBroadcast {
  gameState: GameStateEvent;
  action: GameAction;
  timestamp: number;
}

export interface GuessEvent {
  playerId: string;
  playerName: string;
  letter: string;
  isCorrect: boolean;
  gameState: GameStateEvent;
  timestamp: number;
}

/**
 * Union type for all socket event names
 */
export type SocketEventName =
  | keyof ClientToServerEvents
  | keyof ServerToClientEvents;
