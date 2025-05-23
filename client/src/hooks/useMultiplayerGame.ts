import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import type {
  GameStateEvent,
  GuessEvent,
  NewGameEvent,
  HangGuySocketEvents,
} from "../types/socketTypes";
import type { Socket } from "socket.io-client";

export const useMultiplayerGame = () => {
  const socket = useSocket() as Socket<HangGuySocketEvents>;

  const [gameState, setGameState] = useState<GameStateEvent | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGuessResult, setLastGuessResult] = useState<{
    letter: string;
    isCorrect: boolean;
    playerId: string;
    playerName?: string;
  } | null>(null);

  // Generate unique player ID
  const [playerId] = useState(
    () => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      // Auto-join game on connect
      socket.emit("hangman:join-game");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleGameState = (data: GameStateEvent) => {
      setGameState(data);
      setPlayers(data.players);
    };

    const handlePlayerJoined = (data: {
      playerId: string;
      playerName?: string;
      playerCount: number;
    }) => {
      console.log(`Player joined: ${data.playerName || data.playerId}`);
    };

    const handlePlayerLeft = (data: {
      playerId: string;
      playerCount: number;
    }) => {
      console.log(`Player left: ${data.playerId}`);
    };

    const handleGuessResult = (data: {
      letter: string;
      isCorrect: boolean;
      playerId: string;
      playerName?: string;
      gameState: GameStateEvent;
    }) => {
      setLastGuessResult({
        letter: data.letter,
        isCorrect: data.isCorrect,
        playerId: data.playerId,
        playerName: data.playerName,
      });
      setGameState(data.gameState);
      setPlayers(data.gameState.players);
    };

    const handleGameStarted = (data: {
      startedBy: string;
      gameState: GameStateEvent;
    }) => {
      setGameState(data.gameState);
      setPlayers(data.gameState.players);
      console.log(`New game started by: ${data.startedBy}`);
    };

    const handleError = (data: { message: string; code?: string }) => {
      setError(data.message);
      console.error("Hangman game error:", data);
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("hangman:game-state", handleGameState);
    socket.on("hangman:player-joined", handlePlayerJoined);
    socket.on("hangman:player-left", handlePlayerLeft);
    socket.on("hangman:guess-result", handleGuessResult);
    socket.on("hangman:game-started", handleGameStarted);
    socket.on("hangman:error", handleError);

    // Initial connection check
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup event listeners
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("hangman:game-state", handleGameState);
      socket.off("hangman:player-joined", handlePlayerJoined);
      socket.off("hangman:player-left", handlePlayerLeft);
      socket.off("hangman:guess-result", handleGuessResult);
      socket.off("hangman:game-started", handleGameStarted);
      socket.off("hangman:error", handleError);
    };
  }, [socket]);

  // Game actions
  const guessLetter = useCallback(
    (letter: string) => {
      if (!socket || !isConnected) {
        setError("Not connected to server");
        return;
      }

      const guessData: GuessEvent = {
        letter: letter.toUpperCase(),
        playerId,
        playerName: `Player ${playerId.slice(-4)}`,
      };

      socket.emit("hangman:guess-letter", guessData);
      setError(null);
    },
    [socket, isConnected, playerId]
  );

  const startNewGame = useCallback(
    (options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
    }) => {
      if (!socket || !isConnected) {
        setError("Not connected to server");
        return;
      }

      const newGameData: NewGameEvent = {
        startedBy: playerId,
        ...options,
      };

      socket.emit("hangman:new-game", newGameData);
      setError(null);
    },
    [socket, isConnected, playerId]
  );

  const requestSync = useCallback(() => {
    if (!socket || !isConnected) {
      setError("Not connected to server");
      return;
    }

    socket.emit("hangman:sync-request");
  }, [socket, isConnected]);

  const joinGame = useCallback(() => {
    if (!socket || !isConnected) {
      setError("Not connected to server");
      return;
    }

    socket.emit("hangman:join-game");
  }, [socket, isConnected]);

  const leaveGame = useCallback(() => {
    if (!socket || !isConnected) return;

    socket.emit("hangman:leave-game");
  }, [socket, isConnected]);

  // Cleanup on unmount
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
    playerId,
    isConnected,
    error,
    lastGuessResult,
    actions: {
      guessLetter,
      startNewGame,
      requestSync,
      joinGame,
      leaveGame,
    },
  };
};
