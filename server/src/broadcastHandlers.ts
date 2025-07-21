import { Server, Socket } from "socket.io";
import { GameManager } from "./gameManager";
import { GameStateSynchronizer } from "./gameStateSync";
import {
  GameBroadcast,
  HangGuySocketEvents,
} from "../../shared/types";

const gameManager = new GameManager();
const gameSync = new GameStateSynchronizer(gameManager);
const HANGMAN_ROOM = "hangman-room";

export const setupHangmanBroadcasters = (io: Server, socket: Socket) => {
  // Utility function to broadcast game state to all players
  const broadcastGameState = (action: string, additionalData?: any) => {
    const gameState = gameManager.getGameState();
    const broadcast: GameBroadcast = {
      gameState,
      action: gameState.lastAction!,
      timestamp: Date.now(),
    };

    io.to(HANGMAN_ROOM).emit("hangman:state-broadcast", broadcast);

    // Send specific event broadcasts for better UX
    if (additionalData) {
      io.to(HANGMAN_ROOM).emit(
        action as keyof HangGuySocketEvents,
        additionalData
      );
    }

    console.log(
      `Broadcasted ${action} to ${
        io.sockets.adapter.rooms.get(HANGMAN_ROOM)?.size || 0
      } players`
    );
  };

  // Enhanced join game handler with state synchronization
  socket.on("hangman:join-game", async (data) => {
    console.log("Player attempting to join:", data);

    const playerName =
      data.playerName || `Player${Math.random().toString(36).substr(2, 4)}`;
    const sessionId = data.sessionId || "default";

    try {
      // Join the socket to the session room
      socket.join(sessionId);

      console.log(`Player ${playerName} joined session ${sessionId}`);

      // Handle player join with sync
      const joinResult = await gameSync.handlePlayerJoin(socket, playerName);

      if (joinResult.success) {
        // Emit success event
        socket.emit("hangman:join-success", {
          playerInfo: joinResult.playerInfo,
          gameState: joinResult.gameState,
          sessionId: sessionId,
          isGameInProgress: joinResult.isGameInProgress,
          gameSummary: gameSync.getGameSummary(joinResult.gameState!),
        });

        // Broadcast player join to other players
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
        console.log(`📢 Broadcasted player join for ${playerName}`);
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

  // Enhanced sync request handler
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

      const syncData = gameSync.getGameSummary(gameState);

      socket.emit("hangman:sync-response", {
        gameState,
        playerInfo: player,
        syncData,
        gameSummary: syncData,
        timestamp: Date.now(),
      });

      console.log(`🔄 Sent enhanced sync response to ${player.name}`);
    } catch (error) {
      console.error("❌ Error in sync request:", error);
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
        console.log(`👋 ${playerInfo.name} left the game`);
      }
    } catch (error) {
      console.error("❌ Error in leave-game:", error);
    }
  });

  // Handle letter guess with enhanced validation
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
      console.log(
        `🎯 ${player.name} guessed "${data.letter}" - ${
          result.isCorrect ? "correct" : "incorrect"
        }`
      );
    } catch (error) {
      console.error("❌ Error processing guess:", error);
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
      console.log(`🎮 New game started by ${player.name}`);
    } catch (error) {
      console.error("❌ Error starting new game:", error);
      socket.emit("hangman:error", {
        message: "Failed to start new game",
        code: "NEW_GAME_ERROR",
        timestamp: Date.now(),
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const playerId = socket.id;

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
        console.log(`🔌 ${playerInfo.name} disconnected`);
      }
    } catch (error) {
      console.error("❌ Error handling disconnect:", error);
    }
  });
};
