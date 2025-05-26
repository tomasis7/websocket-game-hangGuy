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
import { ChatPanel } from "./ChatPanel";
import type { ChatMessage } from "../../../shared/types";

interface GameOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const MultiplayerHangGuy: React.FC = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [isJoiningLocal, setIsJoining] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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
    sessionInfo,
    joinError,
    isJoining: userJoining,
    leaveGame,
  } = useUserIdentification();

  // Memoized calculations
  const incorrectGuessCount = gameState?.incorrectGuesses.length || 0;
  const isGameActive = gameState?.status === "playing";
  const isJoining = userJoining || gameJoining || isJoiningLocal;

  // Event handlers with proper typing
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
      setIsJoining(false);
      setShowJoinDialog(false); // This should hide the join dialog
    };

    const handleJoinError = (error: any) => {
      console.error("Failed to join game:", error);
      setIsJoining(false);
      setShowJoinDialog(true);
    };

    socket.on("hangman:join-success", handleJoinSuccess);
    socket.on("hangman:join-error", handleJoinError);
    socket.on("hangman:game-state", handleJoinSuccess);
    socket.on("chat:message-received", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("hangman:join-success", handleJoinSuccess);
      socket.off("hangman:join-error", handleJoinError);
      socket.off("hangman:game-state", handleJoinSuccess);
      socket.off("chat:message-received");
    };
  }, [socket]);

  const handleJoinGame = useCallback(
    (nickname: string, sessionId?: string, avatar?: string): void => {
      console.log("Attempting to join game:", { nickname, sessionId, avatar });
      setIsJoining(true);

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
        setIsJoining(false);
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Game Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Hang Guy</h1>
                <div className="flex gap-4">
                  <GameStatus status={gameState.status} />
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

              {/* Game Controls Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <GameControls
                  gameStatus={gameState.status}
                  onNewGame={handleNewGame}
                  onLeaveGame={() => {
                    // Add leave game logic
                    if (socket) {
                      socket.emit("hangman:leave-game", { userId: socket.id });
                      socket.disconnect();
                    }
                    // Redirect to home or refresh
                    window.location.reload();
                  }}
                  isConnected={isConnected}
                  playerCount={gameState?.players?.length || 0} // Pass the player count
                />
              </div>
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
              } // Transform PlayerInfo to User format
              currentUserId={currentUser?.id}
              sessionInfo={
                sessionInfo
                  ? {
                      ...sessionInfo,
                      userCount: gameState?.players?.length || 0,
                    } // Update count from game players
                  : undefined
              }
            />
            {/* Chat Panel */}
            <div className="mt-6">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
