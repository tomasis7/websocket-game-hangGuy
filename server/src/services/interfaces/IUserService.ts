// Service interface for user management operations
import { User, Result, AsyncResult } from "../../../../shared/types";

export interface IUserService {
  /**
   * Create a new user with the given socket ID and nickname
   */
  createUser(socketId: string, nickname: string): AsyncResult<User>;

  /**
   * Remove a user by their ID
   */
  removeUser(userId: string): AsyncResult<User>;

  /**
   * Get user by socket ID
   */
  getUserBySocketId(socketId: string): AsyncResult<User>;

  /**
   * Get user by user ID
   */
  getUserById(userId: string): AsyncResult<User>;

  /**
   * Get all active users
   */
  getAllUsers(): AsyncResult<User[]>;

  /**
   * Update user activity timestamp
   */
  updateUserActivity(userId: string): AsyncResult<void>;

  /**
   * Check if user exists
   */
  userExists(userId: string): Promise<boolean>;

  /**
   * Clean up inactive users
   */
  cleanupInactiveUsers(maxInactiveTime: number): AsyncResult<string[]>;
}
