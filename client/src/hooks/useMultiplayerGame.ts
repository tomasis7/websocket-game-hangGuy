import { useState, useEffect, useCallback } from "react";
import { socket } from "../socket";
import type { GameStateEvent, PlayerInfo } from "../types/socketTypes";

export const useMultiplayerGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameStateEvent | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

  // Connection state
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  // UI state
  const [notifications, setNotifications] = useState<
    Array<{ message: string; id: number; read: boolean }>
  >([]);
  const [joinWelcome, setJoinWelcome] = useState({
    show: false,
    gameState: null,
    playerInfo: null,
    isGameInProgress: false,
    gameSummary: "",
  });

  // Player information
  const [playerInfo] = useState({
    id: `temp_${Math.random().toString(36).substr(2, 9)}`,
    name: `Player${Math.random().toString(36).substr(2, 4)}`,
    joinedAt: Date.now(),
    isActive: true,
  });

  // Connection events
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      console.log("Socket connected ✅");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected ❌");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Add notification to the list
  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => [
      ...prev,
      { message, id: Date.now(), read: false },
    ]);
  }, []);

  // Game state event handlers
  useEffect(() => {
    // Handle join success
    const handleJoinSuccess = (data: any) => {
      console.log("Join success:", data);
      setIsJoining(false);
      setGameState(data.gameState);
      setPlayers(data.gameState?.players || []);

      // Show welcome message if provided
      if (data.isGameInProgress) {
        setJoinWelcome({
          show: true,
          gameState: data.gameState,
          playerInfo: data.playerInfo,
          isGameInProgress: data.isGameInProgress,
          gameSummary: data.gameSummary || "Game in progress",
        });
      }

      addNotification("Successfully joined the game!");
    };

    // Handle game state broadcast
    const handleStateBroadcast = (data: any) => {
      console.log("Game state broadcast:", data);
      setGameState(data.gameState);
      setPlayers(data.gameState?.players || []);
    };

    // Handle player action broadcast
    const handlePlayerAction = (data: any) => {
      console.log("Player action:", data);
      setGameState(data.gameState);
      setPlayers(data.gameState?.players || []);

      // Add notification
      const action = data.action === "joined" ? "joined" : "left";
      addNotification(`${data.playerName} has ${action} the game.`);
    };

    // Handle guess broadcast
    const handleGuessBroadcast = (data: any) => {
      console.log("Guess broadcast:", data);
      setGameState(data.gameState);

      // Add notification about the guess
      const result = data.isCorrect ? "correct" : "incorrect";
      addNotification(
        `${data.playerName} guessed "${data.letter}" - ${result}!`
      );
    };

    // Handle game start broadcast
    const handleGameStartBroadcast = (data: any) => {
      console.log("Game start broadcast:", data);
      setGameState(data.gameState);
      addNotification(`${data.startedByName} started a new game!`);
    };

    // Handle errors
    const handleError = (data: any) => {
      console.error("Game error:", data);
      setError(data.message);
      addNotification(`Error: ${data.message}`);
      setIsJoining(false);
    };

    // Handle general notifications
    const handleNotification = (message: string) => {
      console.log("Notification:", message);
      addNotification(message);
    };

    // Register all event handlers
    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:state-broadcast", handleStateBroadcast);
    socket.on("hangman:player-action-broadcast", handlePlayerAction);
    socket.on("hangman:guess-broadcast", handleGuessBroadcast);
    socket.on("hangman:game-start-broadcast", handleGameStartBroadcast);
    socket.on("hangman:error", handleError);
    socket.on("notification", handleNotification);

    // Clean up event handlers on unmount
    return () => {
      socket.off("hangman:join-success", handleJoinSuccess);
      socket.off("hangman:state-broadcast", handleStateBroadcast);
      socket.off("hangman:player-action-broadcast", handlePlayerAction);
      socket.off("hangman:guess-broadcast", handleGuessBroadcast);
      socket.off("hangman:game-start-broadcast", handleGameStartBroadcast);
      socket.off("hangman:error", handleError);
      socket.off("notification", handleNotification);
    };
  }, [addNotification]);
  // Game actions
  const actions = {
    joinGame: () => {
      setIsJoining(true);
      socket.emit("hangman:join-game", { playerName: playerInfo.name });
    },

    guessLetter: (letter: string) => {
      socket.emit("hangman:guess-letter", {
        letter: letter.toUpperCase(),
        playerId: playerInfo.id,
        playerName: playerInfo.name,
        timestamp: Date.now(),
      });
    },

    startNewGame: (options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
    }) => {
      socket.emit("hangman:new-game", {
        ...options,
        startedBy: playerInfo.id,
      });
    },

    leaveGame: () => {
      socket.emit("hangman:leave-game");
    },

    dismissWelcome: () => {
      setJoinWelcome((prev) => ({ ...prev, show: false }));
    },
  };

  return {
    gameState,
    players,
    playerInfo,
    isConnected,
    isJoining,
    error,
    notifications,
    joinWelcome,
    actions,
  };
};
