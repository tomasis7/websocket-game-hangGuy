export interface GameStateEvent {
  word: string;
  guessedLetters: string[];
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  status: 'playing' | 'won' | 'lost';
  displayWord: string;
  currentPlayer?: string;
  players: string[];
}

export interface GuessEvent {
  letter: string;
  playerId: string;
  playerName?: string;
}

export interface NewGameEvent {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  startedBy: string;
}

export interface PlayerJoinEvent {
  playerId: string;
  playerName?: string;
  playerCount: number;
}

export interface HangGuySocketEvents {
  // Client to Server
  'hangman:join-game': () => void;
  'hangman:leave-game': () => void;
  'hangman:guess-letter': (data: GuessEvent) => void;
  'hangman:new-game': (data: NewGameEvent) => void;
  'hangman:sync-request': () => void;

  // Server to Client
  'hangman:game-state': (data: GameStateEvent) => void;
  'hangman:player-joined': (data: PlayerJoinEvent) => void;
  'hangman:player-left': (data: { playerId: string; playerCount: number }) => void;
  'hangman:guess-result': (data: { 
    letter: string; 
    isCorrect: boolean; 
    playerId: string; 
    playerName?: string;
    gameState: GameStateEvent;
  }) => void;
  'hangman:game-started': (data: { 
    startedBy: string; 
    gameState: GameStateEvent;
  }) => void;
  'hangman:error': (data: { message: string; code?: string }) => void;
}