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

export interface GameStateEvent {
  word: string;
  guessedLetters: string[];
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  status: "playing" | "won" | "lost";
  displayWord: string;
  currentPlayer?: string;
  players: PlayerInfo[];
  gameId: string;
  lastAction?: GameAction;
}

export interface PlayerInfo {
  avatar: any;
  id: string;
  name: string;
  joinedAt: number;
  isActive: boolean;
}

export interface GameAction {
  type: "guess" | "new_game" | "player_join" | "player_leave";
  playerId: string;
  playerName: string;
  timestamp: number;
  data?: any;
}

export interface GuessEvent {
  letter: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface GameBroadcast {
  gameState: GameStateEvent;
  action: GameAction;
  timestamp: number;
}

export interface HangGuySocketEvents {
  // Client to Server
  "hangman:join-game": (data: { playerName: string }) => void;
  "hangman:leave-game": () => void;
  "hangman:guess-letter": (data: GuessEvent) => void;
  "hangman:new-game": (data: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
    startedBy: string;
  }) => void;
  "hangman:request-sync": () => void;
  "hangman:request-game-history": () => void;

  // Server to Client - Broadcasts
  "hangman:state-broadcast": (data: GameBroadcast) => void;
  "hangman:guess-broadcast": (data: {
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

  // Enhanced response events
  "hangman:join-success": (data: {
    gameState: GameStateEvent;
    playerInfo: PlayerInfo;
    isGameInProgress: boolean;
    gameSummary: string;
    timestamp: number;
  }) => void;

  "hangman:game-in-progress-welcome": (data: {
    message: string;
    gameState: GameStateEvent;
    helpText: string;
    timestamp: number;
  }) => void;

  "hangman:sync-response": (data: {
    gameState: GameStateEvent;
    playerInfo: PlayerInfo;
    gameSummary: string;
    timestamp: number;
  }) => void;

  "hangman:game-history-response": (data: {
    correctGuesses: string[];
    incorrectGuesses: string[];
    guessSequence: string[];
    currentWord: string;
    gameStatus: string;
    playersInvolved: string[];
    timestamp: number;
  }) => void;

  "hangman:error": (data: {
    message: string;
    code?: string;
    timestamp: number;
  }) => void;
}

export interface ClientToServerEvents {
  joinGame: (request: JoinGameRequest & { userId: string }) => void;
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
}

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
}
