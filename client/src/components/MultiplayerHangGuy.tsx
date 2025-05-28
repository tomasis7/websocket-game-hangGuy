import React, { useState, useCallback, useEffect, useMemo } from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
import { GameControls } from "./GameControls";
import { GuessDisplay } from "./GuessDisplay"; // ✅ Add missing import
import { JoinGameWelcome } from "./JoinGameWelcome";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { UserJoinDialog } from "./UserJoinDialog";
import { UserList } from "./UserList";
import { useUserIdentification } from "../hooks/useUserIdentification";
import { socket } from "../socket";
import { ChatPanel } from "./ChatPanel";
import type { ChatMessage, GameStateEvent } from "../../../shared/types"; // ✅ Add GameStateEvent

interface GameOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const MultiplayerHangGuy: React.FC = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [isJoiningLocal, setIsJoiningLocal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const {
    gameState,
    currentUser,
    isConnected,
    isJoining: gameJoining,
    error,
    joinWelcome,
    actions,
  } = useMultiplayerGame();

  const {
    joinError,
    isJoining: userJoining,
    leaveGame,
  } = useUserIdentification();

  // ✅ Fix memoized calculations to ensure updates
  const incorrectGuessCount = useMemo(
    () => gameState?.incorrectGuesses?.length || 0,
    [gameState?.incorrectGuesses]
  );

  const remainingGuesses = useMemo(
    () => gameState?.remainingGuesses ?? 8,
    [gameState?.remainingGuesses]
  );

  const maxGuesses = useMemo(
    () => gameState?.maxGuesses ?? 8,
    [gameState?.maxGuesses]
  );

  const isGameActive = gameState?.status === "playing";
  const isJoining = userJoining || gameJoining || isJoiningLocal;

  // ✅ Add effect to log state changes for debugging
  useEffect(() => {
    if (gameState) {
      console.log("Game state updated:", {
        remainingGuesses: gameState.remainingGuesses,
        maxGuesses: gameState.maxGuesses,
        status: gameState.status,
        incorrectCount: gameState.incorrectGuesses?.length,
      });
    }
  }, [gameState]);

  // Event handlers with proper typing
  const handleGuess = useCallback(
    (letter: string): void => {
      if (isGameActive && isConnected) {
        actions.guessLetter(letter);

        // ✅ Force re-render by logging the action
        console.log(
          `Guessing letter: ${letter}, Current remaining: ${remainingGuesses}`
        );
      }
    },
    [isGameActive, isConnected, actions, remainingGuesses]
  );

  const handleNewGame = useCallback(
    (options?: GameOptions): void => {
      if (isConnected) {
        actions.startNewGame(options);
      }
    },
    [isConnected, actions]
  );

  const handleSendChatMessage = useCallback(
    (message: string) => {
      if (socket && currentUser) {
        socket.emit("chat:send-message", { message });
      }
    },
    [socket, currentUser]
  );

  // Listen for successful join events
  useEffect(() => {
    if (!socket) return;

    const handleJoinSuccess = (data: any) => {
      console.log("Successfully joined game:", data);
      setIsJoiningLocal(false); // ✅ Fix
      setShowJoinDialog(false);
    };

    const handleJoinError = (error: any) => {
      console.error("Failed to join game:", error);
      setIsJoiningLocal(false); // ✅ Fix
      setShowJoinDialog(true);
    };

    // ✅ Fix: Add proper typing and event handling
    const handleGameStateUpdate = (newGameState: GameStateEvent) => {
      console.log("Game state updated:", newGameState);
      setShowJoinDialog(false);
    };

    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    };

    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:error", handleJoinError);
    socket.on("hangman:game-state", handleGameStateUpdate); // ✅ Fix: Use proper handler
    socket.on("chat:message-received", handleChatMessage);

    return () => {
      socket.off("hangman:join-success", handleJoinSuccess);
      socket.off("hangman:error", handleJoinError);
      socket.off("hangman:game-state", handleGameStateUpdate);
      socket.off("chat:message-received", handleChatMessage);
    };
  }, [socket]);
  const handleJoinGame = useCallback(
    (nickname: string, sessionId?: string, avatar?: string): void => {
      console.log("Attempting to join game:", { nickname, sessionId, avatar });
      setIsJoiningLocal(true); // ✅ Fix

      if (socket && socket.connected) {
        // Generate a 6-character session ID to match the validation pattern
        const targetSessionId =
          sessionId || Date.now().toString(36).toUpperCase().slice(-6);

        console.log(
          "Emitting hangman:join-game with sessionId:",
          targetSessionId
        );

        socket.emit("hangman:join-game", {
          playerName: nickname,
          sessionId: targetSessionId,
          avatar,
        });
      } else {
        console.error("Socket not connected");
        setIsJoiningLocal(false);
      }
    },
    [socket]
  );

  const handleLeaveGame = useCallback((): void => {
    leaveGame();
    setShowJoinDialog(true);
  }, [leaveGame]);

  // Remove the duplicate socket effect - it's already handled in useUserIdentification
  // This was causing duplicate event listeners and potential memory leaks

  // Loading/connecting state
  if (!isConnected || isJoining) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isJoining ? "Joining Game..." : "Connecting to Game..."}
          </h2>
          <p className="text-gray-600 mb-4">
            {isJoining
              ? "Please wait while we sync you with the current game state."
              : "Please wait while we connect you to the multiplayer game."}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          <button
            onClick={() => {
              // Call an existing method or implement retry functionality
              if (actions.joinGame) {
                actions.joinGame();
              }
            }}
            disabled={!isConnected}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Retry Connection
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
            onClick={() => {
              // Call an existing method or implement sync functionality
              if (actions.joinGame) {
                actions.joinGame();
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sync Game State
          </button>
        </div>
      </div>
    );
  }

  // Show join dialog if no current user OR showJoinDialog is true
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Game Interface */}
      {gameState && currentUser && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Game Status & Hangman */}
          <div className="space-y-6">
            {" "}
            {/* Game Status */} {/* Game Status */}
            <GameStatus
              status={gameState.status}
              word={gameState.status === "lost" ? gameState.word : undefined}
              remainingGuesses={remainingGuesses}
            />
            {/* Leave Game Button */}
            {currentUser && (
              <div className="text-center mt-4">
                <button
                  onClick={handleLeaveGame}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Leave Game
                </button>
              </div>
            )}
            {/* Hangman Display */}
            <div className="flex justify-center mb-8">
              <HangmanSVGs stage={incorrectGuessCount} />
            </div>
            {/* Word Display */}
            <HangGuyWord
              word={gameState.word}
              correctGuesses={new Set(gameState.correctGuesses)}
            />
          </div>

          {/* Middle Column: Guess Display */}
          <div className="flex justify-center">
            {/* Update the GuessDisplay usage to ensure proper props */}
            <GuessDisplay
              correctGuesses={gameState.correctGuesses || []}
              incorrectGuesses={gameState.incorrectGuesses || []}
              remainingGuesses={remainingGuesses} // ✅ Use memoized value
              maxGuesses={maxGuesses} // ✅ Use memoized value
              gameStatus={gameState.status}
            />
          </div>

          {/* Right Column: Input & Controls */}
          <div className="space-y-6">
            {/* Letter Input */}
            {isGameActive && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  {isGameActive ? "Make Your Guess" : "Game Finished"}
                </h3>
                <LetterInput
                  onGuess={handleGuess}
                  guessedLetters={
                    new Set([
                      ...(gameState.correctGuesses || []),
                      ...(gameState.incorrectGuesses || []),
                    ])
                  }
                />
              </div>
            )}{" "}
            {/* Game Controls */}
            <GameControls
              gameStatus={gameState.status}
              onNewGame={handleNewGame}
              onLeaveGame={handleLeaveGame}
              isConnected={isConnected}
              playerCount={gameState.players?.length || 0}
              disabled={!isConnected}
            />{" "}
            {/* ✅ Add ChatPanel Integration */}
            <div className="bg-white rounded-lg shadow-md">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                currentUser={
                  currentUser
                    ? {
                        id: currentUser.id,
                        nickname: currentUser.name, // Convert name to nickname
                        avatar: currentUser.avatar,
                        isActive: currentUser.isActive,
                        joinedAt: currentUser.joinedAt,
                      }
                    : null
                }
              />
            </div>
            {/* User List - Show connected players */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Connected Players
              </h3>
              <UserList
                users={gameState.players.map((player) => ({
                  ...player,
                  nickname: player.name,
                  isActive: true,
                  joinedAt: Date.now(),
                }))}
                currentUserId={currentUser.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
