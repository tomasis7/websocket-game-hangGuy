export interface User {
  id: string;
  nickname: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface GameState {
  status: "waiting" | "active" | "finished";
  startedAt?: Date;
  endedAt?: Date;
}

export interface GameSession {
  id: string;
  users: User[];
  gameState: GameState;
  createdAt: Date;
  lastActivity: Date;
}

export interface ClientToServerEvents {
  joinGame: (data: { nickname: string; sessionId?: string }) => void;
  leaveGame: () => void;
  getUserList: () => void;
}

export interface ServerToClientEvents {
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userListUpdated: (users: User[]) => void;
  sessionInfo: (session: { id: string; userCount: number }) => void;
}
