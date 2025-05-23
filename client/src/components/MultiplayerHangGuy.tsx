import React, { useState, useCallback } from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { GuessDisplay } from "./GuessDisplay";
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
  const [, setIsJoining] = useState(false);

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
    users,
    sessionInfo,
    userIdentification,
    joinError,
    isJoining: userJoining,
    leaveGame,
  } = useUserIdentification();

  // Memoized calculations
  const incorrectGuessCount = gameState?.incorrectGuesses.length || 0;
  const isGameActive = gameState?.status === "playing";
  const isJoining = userJoining || gameJoining;

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

  const handleJoinGame = useCallback(
    (nickname: string, sessionId?: string, avatar?: string): void => {
      // Use the hangman game system instead of the user identification system
      if (socket && socket.connected) {
        socket.emit("hangman:join-game", {
          playerName: nickname,
          sessionId: sessionId || "default",
          avatar,
        });
        setIsJoining(true);
      } else {
        console.error("Not connected to server");
        // Handle the error appropriately - could use actions.setError or similar
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
          <button
            onClick={() => {
              console.log("Game history request feature not yet implemented");
              // TODO: Implement game history request functionality
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 ml-2"
          >
            Get Game History
          </button>
        </div>
      </div>
    );
  }

  // Show join dialog if no current user
  if (!currentUser || showJoinDialog) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <UserJoinDialog
          onJoin={handleJoinGame}
          isVisible={true}
          error={joinError}
          rooms={[]}
        />
        {isJoining && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Joining game...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with User Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Hang Guy</h1>
          <div className="flex justify-center items-center space-x-4 text-sm">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>

            {/* Session Info */}
            {sessionInfo && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Session: {sessionInfo.id} | {users.length} player(s)
              </span>
            )}

            {/* User Info */}
            {userIdentification && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {currentUser?.avatar} {userIdentification.nickname}
                {userIdentification.isHost && " (Host)"}
              </span>
            )}

            {/* Leave Game Button */}
            <button
              onClick={handleLeaveGame}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Leave Game
            </button>
          </div>
        </div>

        {/* Session Sharing */}
        {sessionInfo && userIdentification?.isHost && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Share this session ID with friends:</strong>
            </p>
            <div className="flex items-center justify-center space-x-2">
              <code className="bg-yellow-100 px-3 py-1 rounded text-lg font-mono">
                {sessionInfo.id}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(sessionInfo.id)}
                className="bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Rest of the game interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Game Status Banner */}
            <div className="mb-8">
              <GameStatus
                status={gameState.status}
                word={gameState.status === "lost" ? gameState.word : undefined}
                remainingGuesses={gameState.remainingGuesses}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Game Visual */}
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <HangmanSVGs
                    stage={incorrectGuessCount}
                    className="w-48 h-60"
                  />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    Word to Guess
                  </h3>
                  <div className="flex justify-center">
                    <HangGuyWord
                      word={gameState.word}
                      correctGuesses={new Set(gameState.correctGuesses)}
                    />
                  </div>
                </div>
              </div>

              {/* Middle Column: Guess Tracking */}
              <div className="flex justify-center">
                <GuessDisplay
                  correctGuesses={new Set(gameState.correctGuesses)}
                  incorrectGuesses={new Set(gameState.incorrectGuesses)}
                  remainingGuesses={gameState.remainingGuesses}
                  maxGuesses={gameState.maxGuesses}
                />
              </div>

              {/* Right Column: Input Controls & Game Controls */}
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    {isGameActive ? "Make Your Guess" : "Game Finished"}
                  </h3>
                  <LetterInput
                    onGuess={handleGuess}
                    disabled={!isGameActive || !isConnected}
                    guessedLetters={
                      new Set([
                        ...gameState.correctGuesses,
                        ...gameState.incorrectGuesses,
                      ])
                    }
                  />
                </div>

                <GameControls
                  onNewGame={handleNewGame}
                  gameStatus={gameState.status}
                  disabled={!isConnected}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <UserList
              users={users}
              currentUserId={currentUser?.id}
              sessionInfo={
                sessionInfo
                  ? { ...sessionInfo, userCount: users.length }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
