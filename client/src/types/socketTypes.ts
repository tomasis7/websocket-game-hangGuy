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
    timestamp: number;
  }) => void;
  "hangman:game-start-broadcast": (data: {
    startedBy: string;
    startedByName: string;
    gameState: GameStateEvent;
    timestamp: number;
  }) => void;
  "hangman:sync-response": (data: GameStateEvent) => void;
  "hangman:error": (data: {
    message: string;
    code?: string;
    timestamp: number;
  }) => void;
}
