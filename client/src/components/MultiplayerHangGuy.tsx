import React, { useState, useCallback, useEffect } from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
import { GameControls } from "./GameControls";
import { JoinGameWelcome } from "./JoinGameWelcome";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { UserJoinDialog } from "./UserJoinDialog";
import { UserList } from "./UserList";
import { useUserIdentification } from "../hooks/useUserIdentification";
import { socket } from "../socket";

interface GameOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const MultiplayerHangGuy: React.FC = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [isJoiningLocal, setIsJoining] = useState(false);
  const [lastUsedPlayerName, setLastUsedPlayerName] = useState<string | null>(
    null
  );

  const {
    gameState,
    isConnected,
    isJoining: gameJoining,
    error,
    joinWelcome,
    actions,
  } = useMultiplayerGame();

  const {
    currentUser,
    joinError,
    isJoining: userJoining,
    leaveGame,
    joinGame: identifyUser,
  } = useUserIdentification();

  const incorrectGuessCount = gameState?.incorrectGuesses.length || 0;
  const isGameActive = gameState?.status === "playing";
  const isJoining = userJoining || gameJoining || isJoiningLocal;

  const handleGuess = useCallback(
    (letter: string): void => {
      if (isGameActive && isConnected) {
        actions.guessLetter(letter);
      }
    },
    [isGameActive, isConnected, actions]
  );

  const handleNewGame = useCallback(
    (options?: GameOptions): void => {
      if (isConnected) {
        actions.startNewGame(options);
      }
    },
    [isConnected, actions]
  );

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleJoinSuccess = () => {
      setIsJoining(false);
      setShowJoinDialog(false);
    };

    const handleJoinError = () => {
      setIsJoining(false);
      setShowJoinDialog(true);
    };

    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:error", handleJoinError);

    return () => {
      socket.off("hangman:join-success", handleJoinSuccess);
      socket.off("hangman:error", handleJoinError);
    };
  }, []);

  const handleJoinGame = useCallback(
    (nickname: string, _sessionId?: string, _avatar?: string): void => {
      setIsJoining(true);
      setLastUsedPlayerName(nickname);
      identifyUser(nickname);

      if (socket && socket.connected) {
        socket.emit("hangman:join-game", {
          playerName: nickname,
        });
      } else {
        setIsJoining(false);
      }
    },
    [identifyUser]
  );

  const handleLeaveGame = useCallback((): void => {
    leaveGame();
    setShowJoinDialog(true);
  }, [leaveGame]);

  // Loading/connecting state
  if (!isConnected || isJoining) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            role="status"
            aria-label="Loading"
          ></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isJoining ? "Joining Game..." : "Connecting to Game..."}
          </h2>
          <p className="text-gray-600 mb-4">
            {isJoining
              ? "Please wait while we sync you with the current game state."
              : "Please wait while we connect you to the multiplayer game."}
          </p>
          {error && (
            <div
              className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
              role="alert"
            >
              Error: {error}
            </div>
          )}
          <button
            onClick={() => {
              if (lastUsedPlayerName) {
                actions.joinGame(lastUsedPlayerName);
              } else {
                setShowJoinDialog(true);
              }
            }}
            disabled={!isConnected}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {lastUsedPlayerName ? "Retry Connection" : "Join Game"}
          </button>
        </div>
      </div>
    );
  }

  // Show welcome modal for new joiners
  if (joinWelcome.show && joinWelcome.gameState && joinWelcome.playerInfo) {
    return (
      <JoinGameWelcome
        gameState={joinWelcome.gameState}
        playerInfo={joinWelcome.playerInfo}
        isGameInProgress={joinWelcome.isGameInProgress}
        gameSummary={joinWelcome.gameSummary}
        onDismiss={actions.dismissWelcome}
      />
    );
  }

  // Show loading if no game state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <button
            onClick={() => actions.joinGame()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sync Game State
          </button>
        </div>
      </div>
    );
  }

  // Show join dialog if needed
  if (
    showJoinDialog ||
    (!currentUser && !gameState?.players?.find((p) => p.id === socket?.id))
  ) {
    return (
      <UserJoinDialog
        onJoin={handleJoinGame}
        isVisible={true}
        error={joinError || error || undefined}
      />
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Game Header */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Hang Guy</h1>
                <div className="flex gap-4 items-center">
                  <GameStatus
                    status={gameState.status}
                    word={gameState.word}
                    remainingGuesses={gameState.remainingGuesses}
                  />
                  {currentUser && (
                    <button
                      onClick={handleLeaveGame}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Leave Game
                    </button>
                  )}
                </div>
              </div>

              {/* Hangman Display */}
              <div className="flex justify-center mb-8">
                <HangmanSVGs stage={incorrectGuessCount} />
              </div>

              {/* Word Display */}
              <HangGuyWord
                word={gameState.word}
                correctGuesses={new Set(gameState.correctGuesses)}
              />

              {/* Letter Input */}
              {isGameActive && (
                <LetterInput
                  onGuess={handleGuess}
                  guessedLetters={
                    new Set([
                      ...gameState.correctGuesses,
                      ...gameState.incorrectGuesses,
                    ])
                  }
                />
              )}

              {/* Game Controls */}
              <GameControls
                gameStatus={gameState.status}
                onNewGame={handleNewGame}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserList
              users={
                gameState?.players?.map((player) => ({
                  id: player.id,
                  nickname: player.name,
                  avatar: player.avatar,
                  isActive: player.isActive,
                  joinedAt: player.joinedAt,
                })) || []
              }
              currentUserId={currentUser?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
