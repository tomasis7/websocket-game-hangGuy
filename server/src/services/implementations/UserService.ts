// User service implementation
import { IUserService } from "../interfaces/IUserService";
import {
  User,
  Result,
  AsyncResult,
  createSuccess,
  createError,
} from "../../../../shared/types";
import {
  ApplicationError,
  createValidationError,
  createNotFoundError,
} from "../../../../shared/errors";

interface UserSession {
  id: string;
  socketId: string;
  lastActivity: Date;
}

export class UserService implements IUserService {
  private users = new Map<string, User>();
  private sessions = new Map<string, UserSession>();
  private socketToUserMap = new Map<string, string>(); // socketId -> userId

  async createUser(socketId: string, nickname: string): AsyncResult<User> {
    try {
      // Validate inputs
      if (!socketId?.trim()) {
        return createError(createValidationError("Socket ID is required"));
      }

      if (!nickname?.trim()) {
        nickname = `Player${Math.floor(Math.random() * 10000)}`;
      }

      if (nickname.length > 50) {
        return createError(
          createValidationError("Nickname must be 50 characters or less")
        );
      }

      // Check if socket already has a user
      const existingUserId = this.socketToUserMap.get(socketId);
      if (existingUserId) {
        const existingUser = this.users.get(existingUserId);
        if (existingUser) {
          return createSuccess(existingUser);
        }
      }

      // Create new user
      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        nickname: nickname.trim(),
        joinedAt: Date.now(),
        isActive: true,
      };

      // Create session
      const session: UserSession = {
        id: user.id,
        socketId,
        lastActivity: new Date(),
      };

      // Store user and session
      this.users.set(user.id, user);
      this.sessions.set(user.id, session);
      this.socketToUserMap.set(socketId, user.id);

      console.log(`User created: ${user.nickname} (${user.id})`);
      return createSuccess(user);
    } catch (error) {
      console.error("Error creating user:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to create user")
      );
    }
  }

  async removeUser(userId: string): AsyncResult<User> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return createError(createNotFoundError("User", userId));
      }

      const session = this.sessions.get(userId);
      if (session) {
        this.socketToUserMap.delete(session.socketId);
        this.sessions.delete(userId);
      }

      this.users.delete(userId);

      console.log(`User removed: ${user.nickname} (${userId})`);
      return createSuccess(user);
    } catch (error) {
      console.error("Error removing user:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to remove user")
      );
    }
  }

  async getUserBySocketId(socketId: string): AsyncResult<User> {
    try {
      const userId = this.socketToUserMap.get(socketId);
      if (!userId) {
        return createError(
          createNotFoundError("User with socket ID", socketId)
        );
      }

      const user = this.users.get(userId);
      if (!user) {
        // Clean up orphaned socket mapping
        this.socketToUserMap.delete(socketId);
        return createError(createNotFoundError("User", userId));
      }

      return createSuccess(user);
    } catch (error) {
      console.error("Error getting user by socket ID:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get user")
      );
    }
  }

  async getUserById(userId: string): AsyncResult<User> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return createError(createNotFoundError("User", userId));
      }
      return createSuccess(user);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get user")
      );
    }
  }

  async getAllUsers(): AsyncResult<User[]> {
    try {
      const users = Array.from(this.users.values()).filter(
        (user) => user.isActive
      );
      return createSuccess(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to get users")
      );
    }
  }

  async updateUserActivity(userId: string): AsyncResult<void> {
    try {
      const session = this.sessions.get(userId);
      if (!session) {
        return createError(createNotFoundError("User session", userId));
      }

      session.lastActivity = new Date();
      return createSuccess(undefined);
    } catch (error) {
      console.error("Error updating user activity:", error);
      return createError(
        new ApplicationError("INTERNAL_ERROR", "Failed to update user activity")
      );
    }
  }

  async userExists(userId: string): Promise<boolean> {
    return this.users.has(userId);
  }

  async cleanupInactiveUsers(maxInactiveTime: number): AsyncResult<string[]> {
    try {
      const now = new Date();
      const removedUsers: string[] = [];

      for (const [userId, session] of this.sessions.entries()) {
        const inactiveTime = now.getTime() - session.lastActivity.getTime();
        if (inactiveTime > maxInactiveTime) {
          const result = await this.removeUser(userId);
          if (result.success) {
            removedUsers.push(userId);
          }
        }
      }

      if (removedUsers.length > 0) {
        console.log(`Cleaned up ${removedUsers.length} inactive users`);
      }

      return createSuccess(removedUsers);
    } catch (error) {
      console.error("Error cleaning up inactive users:", error);
      return createError(
        new ApplicationError(
          "INTERNAL_ERROR",
          "Failed to cleanup inactive users"
        )
      );
    }
  }
}
