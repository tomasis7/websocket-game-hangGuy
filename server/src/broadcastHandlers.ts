import { Server, Socket } from "socket.io";
import { GameManager } from "./gameManager";
import { GameStateSynchronizer } from "./gameStateSync";

const gameManager = new GameManager();
const gameSync = new GameStateSynchronizer(gameManager);
const HANGMAN_ROOM = "hangman-room";

// Rate limiting: track guess timestamps per socket
const guessTimestamps = new Map<string, number[]>();
const MAX_GUESSES_PER_SECOND = 2;
const RATE_TTL = 60_000;

// Periodically prune stale rate-limit entries for sockets that disconnected
// without triggering the disconnect event (e.g. network drop)
setInterval(() => {
  const cutoff = Date.now() - RATE_TTL;
  for (const [id, times] of guessTimestamps) {
    const trimmed = times.filter(t => t > cutoff);
    if (trimmed.length === 0) guessTimestamps.delete(id);
    else guessTimestamps.set(id, trimmed);
  }
}, 30_000).unref();

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  let timestamps = guessTimestamps.get(socketId);
  if (!timestamps) {
    timestamps = [];
    guessTimestamps.set(socketId, timestamps);
  }
  while (timestamps.length > 0 && now - timestamps[0] >= 1000) {
    timestamps.shift();
  }
  if (timestamps.length >= MAX_GUESSES_PER_SECOND) return true;
  timestamps.push(now);
  return false;
}

function broadcastPlayerLeft(socket: Socket, playerId: string, playerInfo: { name: string }) {
  socket.to(HANGMAN_ROOM).emit("hangman:player-action-broadcast", {
    action: "left" as const,
    playerId,
    playerName: playerInfo.name,
    playerCount: gameManager.getPlayerCount(),
    gameState: gameManager.getGameState(),
    timestamp: Date.now(),
  });
}

function sanitizePlayerName(name: unknown): string {
  if (typeof name !== "string") return "";
  return name.trim().replace(/[<>&"']/g, "").slice(0, 20);
}

function emitError(socket: Socket, message: string, code: string) {
  socket.emit("hangman:error", { message, code, timestamp: Date.now() });
}

export const setupHangmanBroadcasters = (io: Server, socket: Socket) => {
  // Join game handler
  socket.on("hangman:join-game", async (data) => {
    const playerName =
      sanitizePlayerName(data?.playerName) ||
      `Player${Math.random().toString(36).substr(2, 4)}`;

    try {
      const joinResult = await gameSync.handlePlayerJoin(socket, playerName);

      if (joinResult.success) {
        socket.emit("hangman:join-success", {
          playerInfo: joinResult.playerInfo,
          gameState: joinResult.gameState,
          isGameInProgress: joinResult.isGameInProgress,
          gameSummary: gameSync.getGameSummary(joinResult.gameState!),
          timestamp: Date.now(),
        });

        const joinBroadcast = {
          action: "joined" as const,
          playerId: socket.id,
          playerName: playerName,
          playerCount: gameManager.getPlayerCount(),
          gameState: joinResult.gameState,
          isNewPlayer: true,
          timestamp: Date.now(),
        };

        socket
          .to(HANGMAN_ROOM)
          .emit("hangman:player-action-broadcast", joinBroadcast);
      } else {
        emitError(socket, joinResult.error || "Failed to join game", "JOIN_ERROR");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      emitError(socket, "Failed to join game", "JOIN_EXCEPTION");
    }
  });

  // Sync request handler
  socket.on("hangman:request-sync", () => {
    try {
      const gameState = gameManager.getGameState();
      const player = gameManager.getPlayer(socket.id);

      if (!player) {
        emitError(socket, "Player not found in game", "PLAYER_NOT_FOUND");
        return;
      }

      const gameSummary = gameSync.getGameSummary(gameState);

      socket.emit("hangman:sync-response", {
        gameState,
        playerInfo: player,
        gameSummary,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error in sync request:", error);
      emitError(socket, "Failed to sync game state", "SYNC_ERROR");
    }
  });

  // Leave game handler
  socket.on("hangman:leave-game", () => {
    const playerId = socket.id;

    try {
      const { removed, playerInfo } = gameManager.removePlayer(playerId);

      if (removed && playerInfo) {
        socket.leave(HANGMAN_ROOM);
        broadcastPlayerLeft(socket, playerId, playerInfo);
      }
    } catch (error) {
      console.error("Error in leave-game:", error);
    }
  });

  // Handle letter guess with validation and rate limiting
  socket.on("hangman:guess-letter", (data) => {
    const playerId = socket.id;

    const letter = typeof data.letter === "string" ? data.letter.trim().toUpperCase() : "";
    if (!/^[A-Z]$/.test(letter)) {
      emitError(socket, "Letter must be a single A-Z character", "INVALID_LETTER");
      return;
    }
    data = { ...data, letter };

    const player = gameManager.getPlayer(playerId);

    if (!player) {
      emitError(socket, "You must join the game first", "NOT_IN_GAME");
      return;
    }

    if (isRateLimited(playerId)) {
      emitError(socket, "Too many guesses — slow down!", "RATE_LIMITED");
      return;
    }

    try {
      const result = gameManager.processGuess(data.letter, playerId);

      if (!result.success) {
        emitError(socket, result.error || "Failed to process guess", "GUESS_ERROR");
        return;
      }

      const guessBroadcast = {
        letter: data.letter,
        isCorrect: result.isCorrect,
        playerId,
        playerName: player.name,
        gameState: result.gameState,
        timestamp: Date.now(),
      };

      io.to(HANGMAN_ROOM).emit("hangman:guess-broadcast", guessBroadcast);
    } catch (error) {
      console.error("Error processing guess:", error);
      emitError(socket, "Failed to process guess", "GUESS_PROCESSING_ERROR");
    }
  });

  // Start new game
  socket.on("hangman:new-game", (data) => {
    const playerId = socket.id;
    const player = gameManager.getPlayer(playerId);

    if (!player) {
      emitError(socket, "You must join the game first", "NOT_IN_GAME");
      return;
    }

    try {
      const gameState = gameManager.startNewGame(data, playerId);

      const newGameBroadcast = {
        startedBy: playerId,
        startedByName: player.name,
        gameState,
        timestamp: Date.now(),
      };

      io.to(HANGMAN_ROOM).emit(
        "hangman:game-start-broadcast",
        newGameBroadcast
      );
    } catch (error) {
      console.error("Error starting new game:", error);
      emitError(socket, "Failed to start new game", "NEW_GAME_ERROR");
    }
  });

  // Handle disconnect — also clean up rate limit data
  socket.on("disconnect", () => {
    const playerId = socket.id;
    guessTimestamps.delete(playerId);

    try {
      const { removed, playerInfo } = gameManager.removePlayer(playerId);

      if (removed && playerInfo) {
        broadcastPlayerLeft(socket, playerId, playerInfo);
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
};
