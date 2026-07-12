import React, { useState, useCallback, useEffect } from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
import { GameControls } from "./GameControls";
import { GuessDisplay } from "./GuessDisplay";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { UserJoinDialog } from "./UserJoinDialog";
import { UserList } from "./UserList";
import { useUserIdentification } from "../hooks/useUserIdentification";
import { socket } from "../socket";
import { QRCodeInvite } from "./QRCodeInvite";
import { TurnBanner } from "./TurnBanner";

interface GameOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  customWord?: string;
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

  // Turn indication only matters with 2+ players; solo play is always "your turn".
  const hasTurnRotation = (gameState?.players?.length ?? 0) >= 2;
  const isMyTurn = !hasTurnRotation || gameState?.currentPlayer === socket.id;
  const currentTurnPlayer = gameState?.players?.find(
    (p) => p.id === gameState?.currentPlayer
  );
  const isWordSetter =
    isGameActive && gameState?.wordSetter === socket.id;

  const handleGuess = useCallback(
    (letter: string): void => {
      if (isGameActive && isConnected && isMyTurn) {
        actions.guessLetter(letter);
      }
    },
    [isGameActive, isConnected, isMyTurn, actions]
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
    const handleJoinSuccess = () => {
      setIsJoining(false);
      setShowJoinDialog(false);
    };
    const handleJoinError = (data: { message: string; code?: string; timestamp: number }) => {
      setIsJoining(false);
      const code = data?.code;
      if (code === "JOIN_ERROR" || code === "JOIN_EXCEPTION" || code === "NOT_IN_GAME") {
        setShowJoinDialog(true);
      }
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

      if (socket.connected) {
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

  // ── Join dialog (shown immediately, even while connecting) ─────────
  // Dialog is visible before connection so users can prepare — submit is
  // disabled until connected (eager UI pattern).
  if (showJoinDialog || (!currentUser && !gameState?.players?.find((p) => p.id === socket.id))) {
    const connectingError = !isConnected ? "Connecting to server…" : undefined;
    return (
      <UserJoinDialog
        onJoin={handleJoinGame}
        isVisible={true}
        error={joinError || error || (isJoining ? "Joining…" : connectingError) || undefined}
      />
    );
  }

  // ── Joining / loading ────────────────────────────────────────────
  if (isJoining) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="panel p-8 text-center max-w-sm w-full">
          <div
            className="w-10 h-10 border-[3px] mx-auto mb-5"
            style={{
              borderColor: 'var(--border-soft)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }}
            role="status"
            aria-label="Loading"
          />
          <h2 className="font-mono text-lg font-bold uppercase tracking-[0.04em] text-ink">
            Joining game
          </h2>
          <p className="font-mono text-xs text-muted mt-2">
            Syncing with the current game state.
          </p>
          {error && (
            <div
              className="font-mono text-xs mt-4 px-3.5 py-3 border-[1.5px] border-line text-ink"
              role="alert"
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
            className="mt-5 w-full font-mono font-bold text-sm uppercase tracking-[0.04em] py-3 bg-accent text-accent-ink transition-[filter] hover:brightness-95 disabled:opacity-40"
          >
            {lastUsedPlayerName ? "Retry" : "Join Game"}
          </button>
        </div>
      </div>
    );
  }

  // ── No game state ────────────────────────────────────────────────
  if (!gameState) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="panel p-6 text-center">
          <button
            onClick={() => actions.joinGame()}
            className="font-mono font-bold text-sm uppercase tracking-[0.04em] py-3 px-6 bg-accent text-accent-ink transition-[filter] hover:brightness-95"
          >
            Sync Game State
          </button>
        </div>
      </div>
    );
  }

  const correctSet = new Set(gameState.correctGuesses);
  const incorrectSet = new Set(gameState.incorrectGuesses);
  const allGuessed = new Set([...gameState.correctGuesses, ...gameState.incorrectGuesses]);

  // ── Main game UI ─────────────────────────────────────────────────
  return (
    <div className="min-h-[100vh] py-5 sm:py-8 flex items-start justify-center">
      {/* Landscape mobile: hangman left, content right */}
      <style>{`
        @media (orientation: landscape) and (max-height: 500px) {
          .game-grid { grid-template-columns: auto 1fr !important; }
          .hangman-col { grid-row: 1 / 3; }
        }
      `}</style>

      <div
        className="game-grid container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 px-2 sm:px-4"
      >
        {/* ── Game area ── */}
        <main
          className="panel p-5 sm:p-8 flex flex-col gap-7 w-full max-w-3xl mx-auto"
          style={{ minHeight: '0' }}
        >
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
            <h1 className="font-mono text-xl font-extrabold tracking-tight bg-accent text-accent-ink px-2 py-0.5">
              HANGGUY<span>/</span>
            </h1>
            <div className="flex items-center gap-2.5">
              <QRCodeInvite />
              <GameStatus
                status={gameState.status}
                word={gameState.status !== "playing" ? gameState.word : undefined}
                remainingGuesses={gameState.remainingGuesses}
              />
              {currentUser && (
                <button
                  onClick={handleLeaveGame}
                  className="font-mono text-xs font-semibold uppercase tracking-[0.04em] px-4 py-2.5 border-[1.5px] border-line text-ink transition-colors hover:bg-accent hover:text-accent-ink hover:border-accent"
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

          {error && (
            <div
              role="alert"
              className="w-full max-w-2xl mx-auto text-center font-mono text-xs font-semibold px-4 py-2.5 border-[1.5px] border-line text-bad"
            >
              {error}
            </div>
          )}

          {/* Turn banner + keyboard */}
          {isGameActive && (hasTurnRotation || isWordSetter) && (
            <TurnBanner
              isMyTurn={isMyTurn}
              currentPlayerName={currentTurnPlayer?.name}
              spectating={isWordSetter}
            />
          )}
          {isGameActive && !isWordSetter && (
            <LetterInput
              onGuess={handleGuess}
              disabled={!isMyTurn}
              guessedLetters={allGuessed}
              correctLetters={correctSet}
              incorrectLetters={incorrectSet}
            />
          )}

          {/* Game controls */}
          <GameControls
            gameStatus={gameState.status}
            onNewGame={handleNewGame}
            playerCount={gameState.players?.length ?? 0}
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
            currentTurnPlayerId={
              hasTurnRotation && isGameActive ? gameState.currentPlayer : undefined
            }
            wordSetterId={isGameActive ? gameState.wordSetter : undefined}
          />
        </aside>
      </div>
    </div>
  );
};
