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

export interface JoinGameRequest {
  nickname: string;
  sessionId?: string;
  avatar?: string;
}

export interface UserIdentification {
  userId: string;
  nickname: string;
  sessionId: string;
  isHost: boolean;
}

export interface JoinGameResponse {
  success: boolean;
  user?: User;
  session?: SessionInfo;
  error?: string;
}

export interface ReconnectResponse {
  success: boolean;
  user?: User;
  session?: SessionInfo;
  error?: string;
}

// ✅ Enhanced GameStateEvent for full compatibility
export interface GameStateEvent {
  word: string;
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  status: "playing" | "won" | "lost";
  displayWord: string;
  guessedLetters?: string[];
  players?: PlayerInfo[];
  gameId?: string;
  lastAction?: GameAction;
}

// ✅ Add missing request types
export interface GuessLetterRequest {
  letter: string;
  playerName?: string;
  timestamp?: number;
}

export interface NewGameRequest {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  startedBy?: string;
}

export interface HangmanErrorResponse {
  message: string;
  code: string;
  timestamp?: number;
}

// ✅ Complete ClientToServerEvents
export interface ClientToServerEvents {
  joinGame: (request: JoinGameRequest & { userId?: string }) => void;
  leaveGame: (data: { userId: string }) => void;
  reconnectToSession: (data: {
    userId: string;
    sessionId: string;
    nickname: string;
  }) => void;
  guessLetter: (data: { letter: string; playerId: string }) => void;
  startNewGame: (options?: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
  }) => void;
  requestSync: () => void;
  requestGameHistory: () => void;

  // Hangman-specific events
  "hangman:join-game": (data: { playerName: string }) => void;
  "hangman:leave-game": (data: { userId: string }) => void;
  "hangman:guess-letter": (data: GuessLetterRequest) => void;
  "hangman:new-game": (data?: NewGameRequest) => void;
  getUserList: () => void;
}

// ✅ Complete ServerToClientEvents
export interface ServerToClientEvents {
  joinGameResponse: (response: JoinGameResponse) => void;
  reconnectResponse: (response: ReconnectResponse) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userListUpdated: (users: User[]) => void;
  sessionUpdated: (session: SessionInfo) => void;
  gameStateUpdated: (gameState: GameStateEvent) => void;
  playerGuessed: (data: {
    playerId: string;
    letter: string;
    isCorrect: boolean;
  }) => void;
  gameEnded: (data: { status: "won" | "lost"; word: string }) => void;
  notification: (message: string) => void;
  error: (error: string) => void;

  // Hangman-specific events
  "hangman:game-started": (data: {
    startedBy: string;
    gameState: GameStateEvent;
  }) => void;
  "hangman:guess-result": (data: {
    letter: string;
    isCorrect: boolean;
    playerId: string;
    playerName: string;
    gameState: GameStateEvent;
  }) => void;
  "hangman:player-left": (data: {
    playerId: string;
    playerCount: number;
    timestamp: number;
  }) => void;
  "hangman:error": (data: HangmanErrorResponse) => void;
  sessionInfo: (data: { id: string; userCount: number }) => void;
}

export interface PlayerInfo {
  id: string;
  name: string;
  joinedAt: number;
  isActive: boolean;
  avatar?: string;
}

export interface GameAction {
  type: "player_join" | "player_leave" | "guess" | "new_game";
  playerId: string;
  playerName: string;
  timestamp: number;
  data?: any;
}

export interface GuessResult {
  letter: string;
  isCorrect: boolean;
  isGameOver: boolean;
  gameStatus: "playing" | "won" | "lost";
  alreadyGuessed: boolean;
  wordRevealed?: string;
}

export interface WordCategory {
  name: string;
  words: string[];
}

export type GameStatus = "playing" | "won" | "lost";
