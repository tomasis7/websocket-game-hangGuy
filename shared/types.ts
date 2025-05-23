export interface User {
  id: string;
  nickname: string;
  sessionId: string;
  joinedAt: Date;
  isActive: boolean;
  avatar?: string;
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
  joinGame: (data: JoinGameRequest) => void;
  leaveGame: () => void;
  getUserList: () => void;
}

export interface ServerToClientEvents {
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userListUpdated: (users: User[]) => void;
  sessionInfo: (session: SessionInfo) => void;
}

export interface SessionInfo {
  id: string;
  userCount: number;
  createdAt: Date;
  isPrivate: boolean;
  hostUserId?: string;
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
