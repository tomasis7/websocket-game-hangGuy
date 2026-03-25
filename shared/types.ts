// ─── Internal Game State (used by game logic) ───────────────────────────────

export interface GuessResult {
  letter: string;
  isCorrect: boolean;
  isAlreadyGuessed: boolean;
  newLettersRevealed: string[];
  gameStateAfter: "playing" | "won" | "lost";
  message: string;
}

export interface GameState {
  word: string;
  guessedLetters: Set<string>;
  correctGuesses: Set<string>;
  incorrectGuesses: Set<string>;
  remainingGuesses: number;
  maxGuesses: number;
  status: "playing" | "won" | "lost";
  displayWord: string;
  lastGuessResult?: GuessResult;
}

// ─── Network/Socket Types (serialized for transport) ─────────────────────────

export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  isActive: boolean;
  joinedAt: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: number;
  isActive: boolean;
}

export interface GameAction {
  type: "guess" | "new_game" | "player_join" | "player_leave";
  playerId: string;
  playerName: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface GuessEvent {
  letter: string;
  playerId: string;
  playerName: string;
  timestamp: number;
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

export interface GameBroadcast {
  gameState: GameStateEvent;
  action: GameAction;
  timestamp: number;
}

// ─── Socket Event Map ────────────────────────────────────────────────────────

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
