import { User } from "../../shared/types";

interface GameSession {
  id: string;
  users: User[];
  gameState: {
    currentWord: string;
    guessedLetters: string[];
    incorrectGuesses: number;
    maxIncorrectGuesses: number;
    gameStatus: "waiting" | "playing" | "won" | "lost";
    displayWord: string;
    remainingGuesses: number;
  };
  createdAt: Date;
  lastActivity: Date;
}

export class UserManager {
  private users = new Map<string, User>();
  private sessions = new Map<string, GameSession>();
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  createUser(socketId: string, nickname: string): User {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      nickname: nickname.trim() || `Player${Math.floor(Math.random() * 1000)}`,
      joinedAt: Date.now(),
      isActive: true,
    };

    this.users.set(user.id, user);
    this.userSocketMap.set(user.id, socketId);
    return user;
  }

  removeUser(userId: string): User | null {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.userSocketMap.delete(userId);
      // Remove user from all sessions
      this.sessions.forEach((session) => {
        session.users = session.users.filter((u) => u.id !== userId);
      });
    }
    return user || null;
  }

  getUserBySocketId(socketId: string): User | null {
    for (const [userId, userSocketId] of this.userSocketMap.entries()) {
      if (userSocketId === socketId) {
        return this.users.get(userId) || null;
      }
    }
    return null;
  }

  addUserToSession(userId: string, sessionId: string = "default"): GameSession {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        users: [],
        gameState: {
          currentWord: "",
          guessedLetters: [],
          incorrectGuesses: 0,
          maxIncorrectGuesses: 8, // This should already be 8
          gameStatus: "waiting",
          displayWord: "",
          remainingGuesses: 8, // This should already be 8
        },
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      this.sessions.set(sessionId, session);
    }

    // Remove user from other sessions first
    this.sessions.forEach((s) => {
      s.users = s.users.filter((u) => u.id !== userId);
    });

    // Add to current session if not already there
    if (!session.users.find((u) => u.id === userId)) {
      session.users.push(user);
    }

    session.lastActivity = new Date();
    return session;
  }

  getSession(sessionId: string = "default"): GameSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllActiveSessions(): GameSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.users.length > 0);
  }

  getActiveUsers(): User[] {
    return Array.from(this.users.values()).filter((u) => u.isActive);
  }

  cleanupInactiveSessions(): void {
    const now = new Date();
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > INACTIVE_THRESHOLD) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
