import React, { useState, useCallback, useEffect } from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
import { GameControls } from "./GameControls";
import { GuessDisplay } from "./GuessDisplay";
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
  const [lastUsedPlayerName, setLastUsedPlayerName] = useState<string | null>(null);

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
    if (!socket) {return;}

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

      if (socket?.connected) {
        socket.emit("hangman:join-game", { playerName: nickname });
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

  // ── Loading / connecting ─────────────────────────────────────────
  if (!isConnected || isJoining) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div
          className="glass-card p-8 text-center max-w-sm w-full"
        >
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4"
            style={{
              borderColor: 'var(--accent)',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
            role="status"
            aria-label="Loading"
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {isJoining ? "Joining Game…" : "Connecting…"}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {isJoining ? "Syncing with the current game state." : "Connecting to the multiplayer server."}
          </p>
          {error && (
            <div
              className="mt-2 px-4 py-3 rounded-xl text-sm"
              role="alert"
              style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
            >
              {error}
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
            className="mt-4 w-full py-2.5 rounded-full font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {lastUsedPlayerName ? "Retry" : "Join Game"}
          </button>
        </div>
      </div>
    );
  }

  // ── Welcome modal ────────────────────────────────────────────────
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

  // ── No game state ────────────────────────────────────────────────
  if (!gameState) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="glass-card p-6 text-center">
          <button
            onClick={() => actions.joinGame()}
            className="py-2.5 px-6 rounded-full font-bold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Sync Game State
          </button>
        </div>
      </div>
    );
  }

  // ── Join dialog ──────────────────────────────────────────────────
  if (showJoinDialog || (!currentUser && !gameState?.players?.find((p) => p.id === socket?.id))) {
    return (
      <UserJoinDialog
        onJoin={handleJoinGame}
        isVisible={true}
        error={joinError || error || undefined}
      />
    );
  }

  const correctSet = new Set(gameState.correctGuesses);
  const incorrectSet = new Set(gameState.incorrectGuesses);
  const allGuessed = new Set([...gameState.correctGuesses, ...gameState.incorrectGuesses]);

  // ── Main game UI ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-[80vh] py-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Landscape mobile: hangman left, content right */}
      <style>{`
        @media (orientation: landscape) and (max-height: 500px) {
          .game-grid { grid-template-columns: auto 1fr !important; }
          .hangman-col { grid-row: 1 / 3; }
        }
      `}</style>

      <div
        className="game-grid container mx-auto grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 px-2"
      >
        {/* ── Game area ── */}
        <main
          className="glass-card p-4 md:p-6 flex flex-col gap-5"
          style={{ minHeight: '0' }}
        >
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--accent)' }}
            >
              Hang Guy
            </h1>
            <div className="flex items-center gap-3">
              <GameStatus
                status={gameState.status}
                word={gameState.status !== "playing" ? gameState.word : undefined}
                remainingGuesses={gameState.remainingGuesses}
              />
              {currentUser && (
                <button
                  onClick={handleLeaveGame}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-80 focus:outline-none focus-visible:ring-2"
                  style={{
                    background: 'rgba(244,63,94,0.10)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                  }}
                >
                  Leave
                </button>
              )}
            </div>
          </div>

          {/* Hangman SVG */}
          <div className="hangman-col flex justify-center">
            <HangmanSVGs stage={incorrectGuessCount} />
          </div>

          {/* Lives + guessed letters */}
          <GuessDisplay
            correctGuesses={gameState.correctGuesses}
            incorrectGuesses={gameState.incorrectGuesses}
            remainingGuesses={gameState.remainingGuesses}
            maxGuesses={8}
          />

          {/* Word display */}
          <HangGuyWord displayWord={gameState.displayWord} />

          {/* Game over status (full card) */}
          {gameState.status !== 'playing' && (
            <GameStatus
              status={gameState.status}
              word={gameState.word}
              remainingGuesses={gameState.remainingGuesses}
            />
          )}

          {/* Keyboard */}
          {isGameActive && (
            <LetterInput
              onGuess={handleGuess}
              guessedLetters={allGuessed}
              correctLetters={correctSet}
              incorrectLetters={incorrectSet}
            />
          )}

          {/* Game controls */}
          <GameControls
            gameStatus={gameState.status}
            onNewGame={handleNewGame}
          />
        </main>

        {/* ── Sidebar ── */}
        <aside>
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
        </aside>
      </div>
    </div>
  );
};
