import { Server, Socket } from "socket.io";
import { GameManager } from "./gameManager";
import { GameStateSynchronizer } from "./gameStateSync";

const gameManager = new GameManager();
const gameSync = new GameStateSynchronizer(gameManager);
const HANGMAN_ROOM = "hangman-room";

// Rate limiting: track guess timestamps per socket
const guessTimestamps = new Map<string, number[]>();
const MAX_GUESSES_PER_SECOND = 2;

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const timestamps = guessTimestamps.get(socketId) || [];
  const recent = timestamps.filter((t) => now - t < 1000);
  guessTimestamps.set(socketId, recent);
  if (recent.length >= MAX_GUESSES_PER_SECOND) return true;
  recent.push(now);
  return false;
}

function sanitizePlayerName(name: unknown): string {
  if (typeof name !== "string") return "";
  return name.trim().replace(/[<>&"']/g, "").slice(0, 20);
}

function isValidGuessLetter(letter: unknown): letter is string {
  return typeof letter === "string" && /^[A-Za-z]$/.test(letter);
}

export const setupHangmanBroadcasters = (io: Server, socket: Socket) => {
  // Join game handler
  socket.on("hangman:join-game", async (data) => {
    const rawName = data?.playerName;
    const playerName =
      sanitizePlayerName(rawName) ||
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
        socket.emit("hangman:error", {
          message: joinResult.error || "Failed to join game",
          code: "JOIN_ERROR",
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit("hangman:error", {
        message: "Failed to join game",
        code: "JOIN_EXCEPTION",
        timestamp: Date.now(),
      });
    }
  });

  // Sync request handler
  socket.on("hangman:request-sync", () => {
    try {
      const gameState = gameManager.getGameState();
      const player = gameManager.getPlayer(socket.id);

      if (!player) {
        socket.emit("hangman:error", {
          message: "Player not found in game",
          code: "PLAYER_NOT_FOUND",
          timestamp: Date.now(),
        });
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
      socket.emit("hangman:error", {
        message: "Failed to sync game state",
        code: "SYNC_ERROR",
        timestamp: Date.now(),
      });
    }
  });

  // Leave game handler
  socket.on("hangman:leave-game", () => {
    const playerId = socket.id;

    try {
      const { removed, playerInfo } = gameManager.removePlayer(playerId);

      if (removed && playerInfo) {
        socket.leave(HANGMAN_ROOM);

        const leaveBroadcast = {
          action: "left" as const,
          playerId,
          playerName: playerInfo.name,
          playerCount: gameManager.getPlayerCount(),
          gameState: gameManager.getGameState(),
          timestamp: Date.now(),
        };

        socket
          .to(HANGMAN_ROOM)
          .emit("hangman:player-action-broadcast", leaveBroadcast);
      }
    } catch (error) {
      console.error("Error in leave-game:", error);
    }
  });

  // Handle letter guess with validation and rate limiting
  socket.on("hangman:guess-letter", (data) => {
    const playerId = socket.id;
    const player = gameManager.getPlayer(playerId);

    if (!player) {
      socket.emit("hangman:error", {
        message: "You must join the game first",
        code: "NOT_IN_GAME",
        timestamp: Date.now(),
      });
      return;
    }

    if (!isValidGuessLetter(data?.letter)) {
      socket.emit("hangman:error", {
        message: "Invalid guess: must be a single letter A-Z",
        code: "INVALID_INPUT",
        timestamp: Date.now(),
      });
      return;
    }

    if (isRateLimited(playerId)) {
      socket.emit("hangman:error", {
        message: "Too many guesses — slow down!",
        code: "RATE_LIMITED",
        timestamp: Date.now(),
      });
      return;
    }

    try {
      const result = gameManager.processGuess(data.letter, playerId);

      if (!result.success) {
        socket.emit("hangman:error", {
          message: result.error || "Failed to process guess",
          code: "GUESS_ERROR",
          timestamp: Date.now(),
        });
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
      socket.emit("hangman:error", {
        message: "Failed to process guess",
        code: "GUESS_PROCESSING_ERROR",
        timestamp: Date.now(),
      });
    }
  });

  // Start new game
  socket.on("hangman:new-game", (data) => {
    const playerId = socket.id;
    const player = gameManager.getPlayer(playerId);

    if (!player) {
      socket.emit("hangman:error", {
        message: "You must join the game first",
        code: "NOT_IN_GAME",
        timestamp: Date.now(),
      });
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
      socket.emit("hangman:error", {
        message: "Failed to start new game",
        code: "NEW_GAME_ERROR",
        timestamp: Date.now(),
      });
    }
  });

  // Handle disconnect — also clean up rate limit data
  socket.on("disconnect", () => {
    const playerId = socket.id;
    guessTimestamps.delete(playerId);

    try {
      const { removed, playerInfo } = gameManager.removePlayer(playerId);

      if (removed && playerInfo) {
        const disconnectBroadcast = {
          action: "left" as const,
          playerId,
          playerName: playerInfo.name,
          playerCount: gameManager.getPlayerCount(),
          gameState: gameManager.getGameState(),
          timestamp: Date.now(),
        };

        socket
          .to(HANGMAN_ROOM)
          .emit("hangman:player-action-broadcast", disconnectBroadcast);
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
};
