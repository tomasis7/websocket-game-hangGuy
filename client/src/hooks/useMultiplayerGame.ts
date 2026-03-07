import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "../socket";
import type {
  GameStateEvent,
  PlayerInfo,
  GameBroadcast,
  HangGuySocketEvents,
} from "../../../shared/types";

type JoinSuccessData = Parameters<HangGuySocketEvents["hangman:join-success"]>[0];
type PlayerActionData = Parameters<HangGuySocketEvents["hangman:player-action-broadcast"]>[0];
type GuessBroadcastData = Parameters<HangGuySocketEvents["hangman:guess-broadcast"]>[0];
type GameStartData = Parameters<HangGuySocketEvents["hangman:game-start-broadcast"]>[0];
type ErrorData = Parameters<HangGuySocketEvents["hangman:error"]>[0];

const MAX_NOTIFICATIONS = 20;
const NOTIFICATION_EXPIRY_MS = 30_000;

export const useMultiplayerGame = () => {
  const [gameState, setGameState] = useState<GameStateEvent | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ message: string; id: number; read: boolean }>
  >([]);
  const [joinWelcome, setJoinWelcome] = useState<{
    show: boolean;
    gameState: GameStateEvent | null;
    playerInfo: PlayerInfo | null;
    isGameInProgress: boolean;
    gameSummary: string;
  }>({
    show: false,
    gameState: null,
    playerInfo: null,
    isGameInProgress: false,
    gameSummary: "",
  });

  const expiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-expire old notifications
  useEffect(() => {
    expiryTimerRef.current = setInterval(() => {
      const cutoff = Date.now() - NOTIFICATION_EXPIRY_MS;
      setNotifications((prev) => prev.filter((n) => n.id > cutoff));
    }, 5000);

    return () => {
      if (expiryTimerRef.current) {clearInterval(expiryTimerRef.current);}
    };
  }, []);

  // Connection events
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => {
      const next = [...prev, { message, id: Date.now(), read: false }];
      return next.length > MAX_NOTIFICATIONS ? next.slice(-MAX_NOTIFICATIONS) : next;
    });
  }, []);

  // Game state event handlers
  useEffect(() => {
    const handleJoinSuccess = (data: JoinSuccessData) => {
      setIsJoining(false);
      setGameState(data.gameState);

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

    const handleStateBroadcast = (data: GameBroadcast) => {
      setGameState(data.gameState);
    };

    const handlePlayerAction = (data: PlayerActionData) => {
      setGameState(data.gameState);
      const verb = data.action === "joined" ? "joined" : "left";
      addNotification(`${data.playerName} has ${verb} the game.`);
    };

    const handleGuessBroadcast = (data: GuessBroadcastData) => {
      setGameState(data.gameState);
      const result = data.isCorrect ? "correct" : "incorrect";
      addNotification(
        `${data.playerName} guessed "${data.letter}" - ${result}!`
      );
    };

    const handleGameStartBroadcast = (data: GameStartData) => {
      setGameState(data.gameState);
      addNotification(`${data.startedByName} started a new game!`);
    };

    const handleError = (data: ErrorData) => {
      setError(data.message);
      addNotification(`Error: ${data.message}`);
      setIsJoining(false);
    };

    const handleNotification = (message: string) => {
      addNotification(message);
    };

    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:state-broadcast", handleStateBroadcast);
    socket.on("hangman:player-action-broadcast", handlePlayerAction);
    socket.on("hangman:guess-broadcast", handleGuessBroadcast);
    socket.on("hangman:game-start-broadcast", handleGameStartBroadcast);
    socket.on("hangman:error", handleError);
    socket.on("notification", handleNotification);

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

  const actions = {
    joinGame: (playerName?: string) => {
      setIsJoining(true);
      const finalPlayerName =
        playerName || `Player${Math.random().toString(36).substr(2, 4)}`;
      socket.emit("hangman:join-game", { playerName: finalPlayerName });
    },

    guessLetter: (letter: string) => {
      socket.emit("hangman:guess-letter", {
        letter: letter.toUpperCase(),
        playerId: socket.id ?? "",
        playerName: "",
        timestamp: Date.now(),
      });
    },

    startNewGame: (options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
    }) => {
      socket.emit("hangman:new-game", {
        ...options,
        startedBy: socket.id ?? "",
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
    isConnected,
    isJoining,
    error,
    notifications,
    joinWelcome,
    actions,
  };
};
