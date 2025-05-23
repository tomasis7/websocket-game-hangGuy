import React, { useEffect } from 'react';
import { HangmanSVGs } from './hangman/HangmanSVGs';
import { HangGuyWord } from './HangGuyWord';
import { GuessDisplay } from './GuessDisplay';
import { LetterInput } from './LetterInput';
import { GameStatus } from './GameStatus';
import { GameControls } from './GameControls';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';

export const MultiplayerHangGuy: React.FC = () => {
  const { 
    gameState, 
    players, 
    playerId, 
    isConnected, 
    error, 
    lastGuessResult,
    actions 
  } = useMultiplayerGame();

  const incorrectGuessCount = gameState?.incorrectGuesses.length || 0;
  const isGameActive = gameState?.status === 'playing';

  const handleGuess = (letter: string) => {
    if (isGameActive && isConnected) {
      actions.guessLetter(letter);
    }
  };

  const handleNewGame = (options?: { category?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => {
    if (isConnected) {
      actions.startNewGame(options);
    }
  };

  // Auto-sync on connection
  useEffect(() => {
    if (isConnected && !gameState) {
      actions.requestSync();
    }
  }, [isConnected, gameState, actions]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to Game...</h2>
          <p className="text-gray-600">Please wait while we connect you to the multiplayer game.</p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Loading Game...</h2>
          <button
            onClick={actions.requestSync}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sync Game State
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with multiplayer info */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hang Guy - Multiplayer</h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥 {players.length} player{players.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🆔 You: Player {playerId.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Last guess result notification */}
        {lastGuessResult && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            lastGuessResult.isCorrect 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {lastGuessResult.playerId === playerId ? (
              <span>
                {lastGuessResult.isCorrect ? '✅' : '❌'} 
                You guessed "{lastGuessResult.letter}" - {lastGuessResult.isCorrect ? 'Correct!' : 'Incorrect!'}
              </span>
            ) : (
              <span>
                {lastGuessResult.isCorrect ? '✅' : '❌'} 
                {lastGuessResult.playerName || `Player ${lastGuessResult.playerId.slice(-4)}`} 
                guessed "{lastGuessResult.letter}" - {lastGuessResult.isCorrect ? 'Correct!' : 'Incorrect!'}
              </span>
            )}
          </div>
        )}
        
        {/* Game Status Banner */}
        <div className="mb-8">
          <GameStatus 
            status={gameState.status}
            word={gameState.status === 'lost' ? gameState.word : undefined}
            remainingGuesses={gameState.remainingGuesses}
          />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Game Visual */}
          <div className="flex flex-col items-center space-y-6">
            {/* SVG Hangman image */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <HangmanSVGs stage={incorrectGuessCount} className="w-48 h-60" />
            </div>

            {/* Display word with underscores */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Word to Guess</h3>
              <div className="flex justify-center">
                <HangGuyWord 
                  word={gameState.word} 
                  correctGuesses={new Set(gameState.correctGuesses)} 
                />
              </div>
            </div>

            {/* Players list */}
            <div className="bg-white rounded-lg shadow-md p-4 w-full">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Players ({players.length})</h4>
              <div className="space-y-1">
                {players.map((player, index) => (
                  <div key={player} className={`text-sm p-2 rounded ${
                    player === playerId ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {player === playerId ? '👤 You' : `👤 Player ${player.slice(-4)}`}
                  </div>
                ))}
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
            {/* Input Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {isGameActive ? 'Make Your Guess' : 'Game Finished'}
              </h3>
              <LetterInput 
                onGuess={handleGuess}
                disabled={!isGameActive || !isConnected}
                guessedLetters={new Set([...gameState.correctGuesses, ...gameState.incorrectGuesses])}
              />
            </div>

            {/* Game Controls */}
            <GameControls
              onNewGame={handleNewGame}
              gameStatus={gameState.status}
              disabled={!isConnected}
            />

            {/* Connection Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 w-full">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Connection</h4>
              <div className="space-y-2">
                <button
                  onClick={actions.requestSync}
                  disabled={!isConnected}
                  className="w-full bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors disabled:bg-gray-400"
                >
                  🔄 Sync Game State
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};