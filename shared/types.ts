export interface User {
  id: string;
  nickname: string;
  sessionId: string;
  joinedAt: Date;
  isActive: boolean;
  avatar?: string;
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
  userId?: string; // Add this for consistency
}

export interface UserIdentification {
  userId: string;
  nickname: string;
  sessionId: string;
  isHost: boolean;
}

// Add proper response types
export interface JoinGameResponse {
  success: boolean;
  error?: string;
  user?: User;
  session?: SessionInfo;
}

export interface ReconnectResponse {
  success: boolean;
  user?: User;
  session?: SessionInfo;
  error?: string;
}

// Fix Socket.IO event types
export interface ClientToServerEvents {
  joinGame: (data: JoinGameRequest & { userId: string }) => void;
  leaveGame: (data: { userId: string }) => void;
  getUserList: () => void;
  reconnectToSession: (data: { userId: string; sessionId: string; nickname: string }) => void;
}

export interface ServerToClientEvents {
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  userListUpdated: (users: User[]) => void;
  sessionInfo: (session: SessionInfo) => void;
  sessionUpdated: (session: SessionInfo) => void;
  joinGameResponse: (response: JoinGameResponse) => void;
  reconnectResponse: (response: ReconnectResponse) => void;
}
