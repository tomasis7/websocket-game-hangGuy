import { useState, useEffect } from "react";
import { socket } from "../socket";
import type {
  GameStateEvent,
  GameBroadcast,
  HangGuySocketEvents,
} from "../../../shared/types";

type JoinSuccessData = Parameters<HangGuySocketEvents["hangman:join-success"]>[0];
type PlayerActionData = Parameters<HangGuySocketEvents["hangman:player-action-broadcast"]>[0];
type GuessBroadcastData = Parameters<HangGuySocketEvents["hangman:guess-broadcast"]>[0];
type GameStartData = Parameters<HangGuySocketEvents["hangman:game-start-broadcast"]>[0];
type ErrorData = Parameters<HangGuySocketEvents["hangman:error"]>[0];

export const useMultiplayerGame = () => {
  const [gameState, setGameState] = useState<GameStateEvent | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

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

  // Game state event handlers
  useEffect(() => {
    const handleJoinSuccess = (data: JoinSuccessData) => {
      setIsJoining(false);
      setGameState(data.gameState);
    };

    const handleStateBroadcast = (data: GameBroadcast) => {
      setGameState(data.gameState);
    };

    const handlePlayerAction = (data: PlayerActionData) => {
      setGameState(data.gameState);
    };

    const handleGuessBroadcast = (data: GuessBroadcastData) => {
      setGameState(data.gameState);
    };

    const handleGameStartBroadcast = (data: GameStartData) => {
      setGameState(data.gameState);
    };

    const handleError = (data: ErrorData) => {
      setError(data.message);
      setIsJoining(false);
    };

    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:state-broadcast", handleStateBroadcast);
    socket.on("hangman:player-action-broadcast", handlePlayerAction);
    socket.on("hangman:guess-broadcast", handleGuessBroadcast);
    socket.on("hangman:game-start-broadcast", handleGameStartBroadcast);
    socket.on("hangman:error", handleError);

    return () => {
      socket.off("hangman:join-success", handleJoinSuccess);
      socket.off("hangman:state-broadcast", handleStateBroadcast);
      socket.off("hangman:player-action-broadcast", handlePlayerAction);
      socket.off("hangman:guess-broadcast", handleGuessBroadcast);
      socket.off("hangman:game-start-broadcast", handleGameStartBroadcast);
      socket.off("hangman:error", handleError);
    };
  }, []);

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
  };

  return {
    gameState,
    isConnected,
    isJoining,
    error,
    actions,
  };
};
