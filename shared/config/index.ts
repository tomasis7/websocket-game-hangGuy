/**
 * Application configuration management
 * Handles environment-based configuration for both client and server
 */

import type { AppConfig } from "../types";

const defaultConfig: AppConfig = {
  environment: process.env.NODE_ENV || "development",
  server: {
    port: 3000,
    host: "localhost",
    logLevel: "info",
  },
  client: {
    apiUrl: "http://localhost:3000",
    socketUrl: "http://localhost:3000",
    url: "http://localhost:3000",
  },
  game: {
    maxPlayers: 10,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxGuesses: 6,
  },
};

/**
 * Environment-specific configuration overrides
 */
const environments = {
  development: {
    ...defaultConfig,
    environment: "development",
    server: {
      ...defaultConfig.server,
      port: parseInt(process.env.PORT || "3000"),
      host: process.env.HOST || "localhost",
      logLevel: process.env.LOG_LEVEL || "debug",
    },
    client: {
      ...defaultConfig.client,
      url: process.env.CLIENT_URL || "http://localhost:3000",
    },
  },

  production: {
    ...defaultConfig,
    environment: "production",
    server: {
      ...defaultConfig.server,
      port: parseInt(process.env.PORT || "3000"),
      host: process.env.HOST || "0.0.0.0",
      logLevel: process.env.LOG_LEVEL || "info",
    },
    client: {
      ...defaultConfig.client,
      apiUrl: process.env.API_URL || "http://localhost:3000",
      socketUrl: process.env.SOCKET_URL || "http://localhost:3000",
      url: process.env.CLIENT_URL || "http://localhost:3000",
    },
  },

  test: {
    ...defaultConfig,
    environment: "test",
    server: {
      ...defaultConfig.server,
      port: parseInt(process.env.TEST_PORT || "3001"),
      host: "localhost",
      logLevel: process.env.LOG_LEVEL || "error",
    },
    client: {
      ...defaultConfig.client,
      url: process.env.CLIENT_URL || "http://localhost:3001",
    },
    game: {
      ...defaultConfig.game,
      sessionTimeout: 5 * 60 * 1000, // 5 minutes for testing
    },
  },
} as const;

/**
 * Get configuration for the current environment
 */
export function getConfig(): AppConfig {
  const env = (process.env.NODE_ENV ||
    "development") as keyof typeof environments;
  return environments[env] || environments.development;
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const requiredEnvVars = {
    development: [],
    production: ["API_URL", "SOCKET_URL"],
    test: [],
  };

  const env = (process.env.NODE_ENV ||
    "development") as keyof typeof requiredEnvVars;
  const required = requiredEnvVars[env] || [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is missing`);
    }
  }
}

export { defaultConfig };
export const config = getConfig();
export type { AppConfig };
