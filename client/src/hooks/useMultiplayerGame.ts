import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import type {
  GameStateEvent,
  PlayerInfo,
  HangGuySocketEvents,
} from "../types/socketTypes";
import type { Socket } from "socket.io-client";

export const useMultiplayerGame = (playerName?: string) => {
  const socket = useSocket() as Socket<HangGuySocketEvents>;

  const [gameState, setGameState] = useState<GameStateEvent | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinWelcome, setJoinWelcome] = useState<{
    show: boolean;
    gameState?: GameStateEvent;
    playerInfo?: PlayerInfo;
    isGameInProgress: boolean;
    gameSummary: string;
  }>({
    show: false,
    isGameInProgress: false,
    gameSummary: "",
  });

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "info" | "success" | "error" | "warning";
      timestamp: number;
    }>
  >([]);

  const [playerInfo] = useState(() => ({
    id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: playerName || `Player${Math.random().toString(36).substr(2, 4)}`,
  }));

  const addNotification = useCallback(
    (
      message: string,
      type: "info" | "success" | "error" | "warning" = "info"
    ) => {
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        message,
        type,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev.slice(-4), notification]); // Keep only last 5 notifications

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 5000);
    },
    []
  );

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      setIsJoining(true);
      addNotification("Connected to game server", "success");

      // Auto-join game on connect
      socket.emit("hangman:join-game", { playerName: playerInfo.name });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsJoining(false);
      addNotification("Disconnected from game server", "error");
    };

    // Enhanced join success handler
    const handleJoinSuccess = (data: {
      gameState: GameStateEvent;
      playerInfo: PlayerInfo;
      isGameInProgress: boolean;
      gameSummary: string;
      timestamp: number;
    }) => {
      setIsJoining(false);
      setGameState(data.gameState);
      setPlayers(data.gameState.players);

      // Show welcome modal for new players
      setJoinWelcome({
        show: true,
        gameState: data.gameState,
        playerInfo: data.playerInfo,
        isGameInProgress: data.isGameInProgress,
        gameSummary: data.gameSummary,
      });

      addNotification(
        data.isGameInProgress
          ? "Joined ongoing game - you can start playing!"
          : "Joined game - waiting for game to start",
        "success"
      );
    };

    // Handle welcome message for ongoing games
    const handleGameInProgressWelcome = (data: {
      message: string;
      gameState: GameStateEvent;
      helpText: string;
      timestamp: number;
    }) => {
      addNotification(data.message, "info");
      console.log("Game in progress welcome:", data.helpText);
    };

    // Enhanced sync response handler - fix type mismatch
    const handleSyncResponse = (data: GameStateEvent | {
      gameState: GameStateEvent;
      playerInfo: PlayerInfo;
      gameSummary: string;
      timestamp: number;
    }) => {
      // Handle both old and new sync response formats
      if ('gameState' in data) {
        setGameState(data.gameState);
        setPlayers(data.gameState.players);
      } else {
        setGameState(data);
        setPlayers(data.players);
      }
      addNotification("Game state synchronized", "info");
    };

    // Game history response
    const handleGameHistoryResponse = (data: {
      correctGuesses: string[];
      incorrectGuesses: string[];
      guessSequence: string[];
      currentWord: string;
      gameStatus: string;
      playersInvolved: string[];
      timestamp: number;
    }) => {
      console.log("Game history received:", data);
      addNotification(
        `Game history: ${data.guessSequence.length} guesses made`,
        "info"
      );
    };

    // Existing handlers...
    const handleGuessBroadcast = (data: {
      letter: string;
      isCorrect: boolean;
      playerId: string;
      playerName: string;
      gameState: GameStateEvent;
      timestamp: number;
    }) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players);

      const isOwnGuess = data.playerId === socket.id;
      const message = isOwnGuess
        ? `You guessed "${data.letter}" - ${
            data.isCorrect ? "Correct!" : "Incorrect!"
          }`
        : `${data.playerName} guessed "${data.letter}" - ${
            data.isCorrect ? "Correct!" : "Incorrect!"
          }`;

      addNotification(message, data.isCorrect ? "success" : "warning");
    };

    const handlePlayerActionBroadcast = (data: {
      action: "joined" | "left";
      playerId: string;
      playerName: string;
      playerCount: number;
      gameState: GameStateEvent;
      isNewPlayer?: boolean;
      timestamp: number;
    }) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players);

      // Don't show notification for own join
      if (data.playerId !== socket.id) {
        const message =
          data.action === "joined"
            ? `${data.playerName} joined the game (${data.playerCount} players)`
            : `${data.playerName} left the game (${data.playerCount} players)`;

        addNotification(message, "info");
      }
    };

    const handleGameStartBroadcast = (data: {
      startedBy: string;
      startedByName: string;
      gameState: GameStateEvent;
      timestamp: number;
    }) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players);

      const isOwnStart = data.startedBy === socket.id;
      const message = isOwnStart
        ? "You started a new game!"
        : `${data.startedByName} started a new game!`;

      addNotification(message, "success");
    };

    const handleError = (data: {
      message: string;
      code?: string;
      timestamp: number;
    }) => {
      setError(data.message);
      setIsJoining(false);
      addNotification(`Error: ${data.message}`, "error");
      console.error("Hangman game error:", data);
    };

    // Register all event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:game-in-progress-welcome", handleGameInProgressWelcome);
    socket.on("hangman:sync-response", handleSyncResponse);
    socket.on("hangman:game-history-response", handleGameHistoryResponse);
    socket.on("hangman:guess-broadcast", handleGuessBroadcast);
    socket.on("hangman:player-action-broadcast", handlePlayerActionBroadcast);
    socket.on("hangman:game-start-broadcast", handleGameStartBroadcast);
    socket.on("hangman:error", handleError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("hangman:join-success", handleJoinSuccess);
      socket.off(
        "hangman:game-in-progress-welcome",
        handleGameInProgressWelcome
      );
      socket.off("hangman:sync-response", handleSyncResponse);
      socket.off("hangman:game-history-response", handleGameHistoryResponse);
      socket.off("hangman:guess-broadcast", handleGuessBroadcast);
      socket.off(
        "hangman:player-action-broadcast",
        handlePlayerActionBroadcast
      );
      socket.off("hangman:game-start-broadcast", handleGameStartBroadcast);
      socket.off("hangman:error", handleError);
    };
  }, [socket, playerInfo.name, addNotification]);

  // Game actions
  const guessLetter = useCallback(
    (letter: string) => {
      if (!socket || !isConnected) {
        addNotification("Not connected to server", "error");
        return;
      }

      socket.emit("hangman:guess-letter", {
        letter: letter.toUpperCase(),
        playerId: socket.id!,
        playerName: playerInfo.name,
        timestamp: Date.now(),
      });

      setError(null);
    },
    [socket, isConnected, playerInfo.name, addNotification]
  );

  const startNewGame = useCallback(
    (options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
    }) => {
      if (!socket || !isConnected) {
        addNotification("Not connected to server", "error");
        return;
      }

      socket.emit("hangman:new-game", {
        startedBy: socket.id!,
        ...options,
      });

      setError(null);
    },
    [socket, isConnected, addNotification]
  );

  const requestSync = useCallback(() => {
    if (!socket || !isConnected) {
      addNotification("Not connected to server", "error");
      return;
    }

    socket.emit("hangman:request-sync");
  }, [socket, isConnected, addNotification]);

  const requestGameHistory = useCallback(() => {
    if (!socket || !isConnected) {
      addNotification("Not connected to server", "error");
      return;
    }

    socket.emit("hangman:request-game-history");
  }, [socket, isConnected, addNotification]);

  const dismissWelcome = useCallback(() => {
    setJoinWelcome((prev) => ({ ...prev, show: false }));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    return () => {
      if (socket && isConnected) {
        socket.emit("hangman:leave-game");
      }
    };
  }, [socket, isConnected]);

  return {
    gameState,
    players,
    playerInfo,
    isConnected,
    isJoining,
    error,
    notifications,
    joinWelcome,
    actions: {
      guessLetter,
      startNewGame,
      requestSync,
      requestGameHistory,
      dismissWelcome,
      clearNotifications,
    },
  };
};
