import { useState, useEffect, useCallback } from "react";
import { socket } from "../socket";
import type { GameStateEvent, PlayerInfo } from "../types/socketTypes";

// Ensure game state updates trigger re-renders
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

  // Ensure game state updates trigger re-renders
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (newGameState: GameStateEvent) => {
      console.log("Received game state update:", newGameState);

      // ✅ Force state update by creating new object
      setGameState((prevState) => {
        if (
          !prevState ||
          prevState.remainingGuesses !== newGameState.remainingGuesses ||
          prevState.incorrectGuesses.length !==
            newGameState.incorrectGuesses.length
        ) {
          return { ...newGameState };
        }
        return prevState;
      });
    };

    const handleGuessResult = (result: any) => {
      console.log("Guess result received:", result);

      // ✅ Update game state from guess result
      if (result.gameState) {
        setGameState({ ...result.gameState });
      }
    };

    socket.on("hangman:game-state", handleGameStateUpdate);
    socket.on("hangman:guess-result", handleGuessResult);

    return () => {
      socket.off("hangman:game-state", handleGameStateUpdate);
      socket.off("hangman:guess-result", handleGuessResult);
    };
  }, [socket]);

  // Game actions
  const actions = {
    joinGame: () => {
      setIsJoining(true);
      socket.emit("hangman:join-game", { playerName: "Player" });
    },

    guessLetter: (letter: string) => {
      socket.emit("hangman:guess-letter", {
        letter: letter.toUpperCase(),
        timestamp: Date.now(),
      });
    },

    startNewGame: (options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
    }) => {
      socket.emit("hangman:new-game", {
        ...options,
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
    isConnected,
    isJoining,
    error,
    notifications,
    joinWelcome,
    actions,
  };
};
