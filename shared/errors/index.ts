/**
 * Centralized error handling system
 * Provides consistent error creation, formatting, and handling
 */

import type { AppError, ErrorCode } from "../types";

/**
 * Base application error class
 */
export class ApplicationError extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly details?: any;
  public readonly timestamp: number;

  constructor(code: ErrorCode, message: string, details?: any) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
  /**
   * Convert error to JSON for transmission
   */
  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      toJSON: () => this.toJSON(),
      getUserMessage: () => this.getUserMessage(),
      name: this.name,
    };
  }

  /**
   * Create a user-friendly error message
   */
  getUserMessage(): string {
    const userMessages: Record<ErrorCode, string> = {
      INVALID_INPUT: "The provided input is not valid.",
      USER_NOT_FOUND: "User not found.",
      SESSION_NOT_FOUND: "Game session not found.",
      GAME_NOT_FOUND: "Game not found.",
      PERMISSION_DENIED: "You do not have permission to perform this action.",
      CONNECTION_ERROR: "Connection error occurred.",
      VALIDATION_ERROR: "Validation failed.",
      INTERNAL_ERROR: "An internal error occurred. Please try again later.",
    };

    return userMessages[this.code] || this.message;
  }
}

/**
 * Factory functions for common error types
 */
export const ErrorFactory = {
  invalidInput: (message: string, details?: any) =>
    new ApplicationError("INVALID_INPUT", message, details),

  userNotFound: (userId: string) =>
    new ApplicationError("USER_NOT_FOUND", `User ${userId} not found`),

  sessionNotFound: (sessionId: string) =>
    new ApplicationError("SESSION_NOT_FOUND", `Session ${sessionId} not found`),

  gameNotFound: (gameId: string) =>
    new ApplicationError("GAME_NOT_FOUND", `Game ${gameId} not found`),

  permissionDenied: (action: string) =>
    new ApplicationError(
      "PERMISSION_DENIED",
      `Permission denied for action: ${action}`
    ),

  connectionError: (message: string) =>
    new ApplicationError("CONNECTION_ERROR", message),

  validationError: (field: string, reason: string) =>
    new ApplicationError(
      "VALIDATION_ERROR",
      `Validation failed for ${field}: ${reason}`
    ),

  internalError: (message?: string) =>
    new ApplicationError("INTERNAL_ERROR", message || "Internal server error"),
};

/**
 * Error handler for async functions
 */
export function handleAsync<T>(
  promise: Promise<T>
): Promise<[T | null, ApplicationError | null]> {
  return promise
    .then<[T, null]>((data: T) => [data, null])
    .catch<[null, ApplicationError]>((error: Error) => {
      if (error instanceof ApplicationError) {
        return [null, error];
      }
      return [null, ErrorFactory.internalError(error.message)];
    });
}

/**
 * Type guard to check if an error is an ApplicationError
 */
export function isApplicationError(error: any): error is ApplicationError {
  return error instanceof ApplicationError;
}

/**
 * Formats any error into a consistent AppError format
 */
export function formatError(error: unknown): AppError {
  if (isApplicationError(error)) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return new ApplicationError("INTERNAL_ERROR", error.message).toJSON();
  }

  return new ApplicationError(
    "INTERNAL_ERROR",
    "An unknown error occurred",
    error
  ).toJSON();
}

/**
 * Convenient factory functions for creating specific error types
 */
export const createValidationError = (message: string, details?: any) =>
  new ApplicationError("VALIDATION_ERROR", message, details);

export const createNotFoundError = (resource: string, identifier?: string) =>
  new ApplicationError(
    "USER_NOT_FOUND",
    identifier ? `${resource} ${identifier} not found` : `${resource} not found`
  );

export const createConflictError = (resource: string, identifier?: string) =>
  new ApplicationError(
    "PERMISSION_DENIED",
    identifier ? `${resource} ${identifier} already exists` : resource
  );

/**
 * Result type factory functions
 */
export function createSuccess<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function createError(error: ApplicationError): {
  success: false;
  error: ApplicationError;
};
export function createError(error: Error): {
  success: false;
  error: ApplicationError;
};
export function createError(error: ApplicationError | Error): {
  success: false;
  error: ApplicationError;
} {
  if (error instanceof ApplicationError) {
    return { success: false, error };
  }
  // Convert regular Error to ApplicationError
  return {
    success: false,
    error: new ApplicationError("INTERNAL_ERROR", error.message),
  };
}

/**
 * Simple function to convert Error to ApplicationError for direct use
 */
export function toApplicationError(
  error: Error | ApplicationError
): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }
  return new ApplicationError("INTERNAL_ERROR", error.message);
}
