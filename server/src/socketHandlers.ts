import { Server, Socket } from 'socket.io';
import { MultiplayerHangmanGame } from './hangmanGame';
import { HangGuySocketEvents } from '../../client/src/types/socketTypes';

const hangmanGame = new MultiplayerHangmanGame();

export const setupHangmanHandlers = (io: Server, socket: Socket) => {
  // Join game
  socket.on('hangman:join-game', () => {
    const playerId = socket.id;
    
    // Add player to game
    hangmanGame.addPlayer(playerId);
    
    // Join socket room
    socket.join('hangman-room');
    
    // Send current game state to the new player
    socket.emit('hangman:game-state', hangmanGame.getGameState());
    
    // Notify other players
    socket.to('hangman-room').emit('hangman:player-joined', {
      playerId,
      playerCount: hangmanGame.getPlayerCount()
    });

    console.log(`Player ${playerId} joined hangman game. Total players: ${hangmanGame.getPlayerCount()}`);
  });

  // Leave game
  socket.on('hangman:leave-game', () => {
    const playerId = socket.id;
    
    hangmanGame.removePlayer(playerId);
    socket.leave('hangman-room');
    
    // Notify other players
    socket.to('hangman-room').emit('hangman:player-left', {
      playerId,
      playerCount: hangmanGame.getPlayerCount()
    });

    console.log(`Player ${playerId} left hangman game. Total players: ${hangmanGame.getPlayerCount()}`);
  });

  // Handle letter guess
  socket.on('hangman:guess-letter', (data) => {
    const playerId = socket.id;
    
    try {
      // Validate guess
      const canGuess = hangmanGame.canPlayerGuess(playerId, data.letter);
      if (!canGuess.canGuess) {
        socket.emit('hangman:error', {
          message: canGuess.reason || 'Cannot make guess',
          code: 'INVALID_GUESS'
        });
        return;
      }

      // Process the guess
      const result = hangmanGame.processGuess(data.letter, playerId);
      
      // Broadcast result to all players in the room
      io.to('hangman-room').emit('hangman:guess-result', {
        letter: data.letter,
        isCorrect: result.isCorrect,
        playerId,
        playerName: data.playerName,
        gameState: result.gameState
      });

      console.log(`Player ${playerId} guessed "${data.letter}" - ${result.isCorrect ? 'Correct' : 'Incorrect'}`);
      
    } catch (error) {
      console.error('Error processing guess:', error);
      socket.emit('hangman:error', {
        message: 'Failed to process guess',
        code: 'GUESS_ERROR'
      });
    }
  });

  // Start new game
  socket.on('hangman:new-game', (data) => {
    const playerId = socket.id;
    
    try {
      const gameState = hangmanGame.startNewGame(data);
      
      // Broadcast new game to all players
      io.to('hangman-room').emit('hangman:game-started', {
        startedBy: playerId,
        gameState
      });

      console.log(`New game started by player ${playerId}`);
      
    } catch (error) {
      console.error('Error starting new game:', error);
      socket.emit('hangman:error', {
        message: 'Failed to start new game',
        code: 'NEW_GAME_ERROR'
      });
    }
  });

  // Sync request
  socket.on('hangman:sync-request', () => {
    socket.emit('hangman:game-state', hangmanGame.getGameState());
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const playerId = socket.id;
    hangmanGame.removePlayer(playerId);
    
    // Notify other players
    socket.to('hangman-room').emit('hangman:player-left', {
      playerId,
      playerCount: hangmanGame.getPlayerCount()
    });

    console.log(`Player ${playerId} disconnected from hangman game. Total players: ${hangmanGame.getPlayerCount()}`);
  });
};