import { Server, Socket } from 'socket.io';
import { GameManager } from './gameManager';
import { GameBroadcast, HangGuySocketEvents } from '../../client/src/types/socketTypes';

const gameManager = new GameManager();
const HANGMAN_ROOM = 'hangman-room';

export const setupHangmanBroadcasters = (io: Server, socket: Socket) => {
  
  // Utility function to broadcast game state to all players
  const broadcastGameState = (action: string, additionalData?: any) => {
    const gameState = gameManager.getGameState();
    const broadcast: GameBroadcast = {
      gameState,
      action: gameState.lastAction!,
      timestamp: Date.now()
    };

    io.to(HANGMAN_ROOM).emit('hangman:state-broadcast', broadcast);

    // Send specific event broadcasts for better UX
    if (additionalData) {
      io.to(HANGMAN_ROOM).emit(action as keyof HangGuySocketEvents, additionalData);
    }

    console.log(`Broadcasted ${action} to ${io.sockets.adapter.rooms.get(HANGMAN_ROOM)?.size || 0} players`);
  };

  // Join game
  socket.on('hangman:join-game', (data) => {
    const playerId = socket.id;
    const playerName = data.playerName || `Player${Math.random().toString(36).substr(2, 4)}`;
    
    try {
      // Add player to game
      const playerInfo = gameManager.addPlayer(playerId, playerName);
      
      // Join socket room
      socket.join(HANGMAN_ROOM);
      
      // Send current game state to the new player first
      socket.emit('hangman:sync-response', gameManager.getGameState());
      
      // Broadcast player joined to all other players
      const joinBroadcast = {
        action: 'joined' as const,
        playerId,
        playerName,
        playerCount: gameManager.getPlayerCount(),
        gameState: gameManager.getGameState(),
        timestamp: Date.now()
      };

      socket.to(HANGMAN_ROOM).emit('hangman:player-action-broadcast', joinBroadcast);

      console.log(`Player ${playerName} joined. Broadcasting to room.`);
      
    } catch (error) {
      console.error('Error in join-game:', error);
      socket.emit('hangman:error', {
        message: 'Failed to join game',
        code: 'JOIN_ERROR',
        timestamp: Date.now()
      });
    }
  });

  // Leave game
  socket.on('hangman:leave-game', () => {
    const playerId = socket.id;
    
    try {
      const { removed, playerInfo } = gameManager.removePlayer(playerId);
      
      if (removed && playerInfo) {
        socket.leave(HANGMAN_ROOM);
        
        // Broadcast player left to remaining players
        const leaveBroadcast = {
          action: 'left' as const,
          playerId,
          playerName: playerInfo.name,
          playerCount: gameManager.getPlayerCount(),
          gameState: gameManager.getGameState(),
          timestamp: Date.now()
        };

        socket.to(HANGMAN_ROOM).emit('hangman:player-action-broadcast', leaveBroadcast);
        console.log(`Player ${playerInfo.name} left. Broadcasting to room.`);
      }
      
    } catch (error) {
      console.error('Error in leave-game:', error);
    }
  });

  // Handle letter guess with broadcasting
  socket.on('hangman:guess-letter', (data) => {
    const playerId = socket.id;
    
    try {
      const result = gameManager.processGuess(data.letter, playerId);
      
      if (!result.success) {
        socket.emit('hangman:error', {
          message: result.error || 'Failed to process guess',
          code: 'GUESS_ERROR',
          timestamp: Date.now()
        });
        return;
      }

      // Broadcast guess result to ALL players in the room (including the guesser)
      const guessBroadcast = {
        letter: data.letter,
        isCorrect: result.isCorrect,
        playerId,
        playerName: data.playerName,
        gameState: result.gameState,
        timestamp: Date.now()
      };

      io.to(HANGMAN_ROOM).emit('hangman:guess-broadcast', guessBroadcast);

      // Also broadcast general state update
      broadcastGameState('hangman:guess-broadcast');

      console.log(`Broadcasted guess "${data.letter}" by ${data.playerName} (${result.isCorrect ? 'correct' : 'incorrect'})`);
      
    } catch (error) {
      console.error('Error processing guess:', error);
      socket.emit('hangman:error', {
        message: 'Failed to process guess',
        code: 'GUESS_PROCESSING_ERROR',
        timestamp: Date.now()
      });
    }
  });

  // Start new game with broadcasting
  socket.on('hangman:new-game', (data) => {
    const playerId = socket.id;
    const player = gameManager.getPlayer(playerId);
    
    if (!player) {
      socket.emit('hangman:error', {
        message: 'Player not found',
        code: 'PLAYER_NOT_FOUND',
        timestamp: Date.now()
      });
      return;
    }

    try {
      const gameState = gameManager.startNewGame(data, playerId);
      
      // Broadcast new game started to ALL players
      const newGameBroadcast = {
        startedBy: playerId,
        startedByName: player.name,
        gameState,
        timestamp: Date.now()
      };

      io.to(HANGMAN_ROOM).emit('hangman:game-start-broadcast', newGameBroadcast);

      // Also broadcast general state update
      broadcastGameState('hangman:game-start-broadcast');

      console.log(`Broadcasted new game started by ${player.name}`);
      
    } catch (error) {
      console.error('Error starting new game:', error);
      socket.emit('hangman:error', {
        message: 'Failed to start new game',
        code: 'NEW_GAME_ERROR',
        timestamp: Date.now()
      });
    }
  });

  // Sync request
  socket.on('hangman:request-sync', () => {
    try {
      socket.emit('hangman:sync-response', gameManager.getGameState());
      console.log(`Sent sync response to ${socket.id}`);
    } catch (error) {
      console.error('Error sending sync response:', error);
      socket.emit('hangman:error', {
        message: 'Failed to sync game state',
        code: 'SYNC_ERROR',
        timestamp: Date.now()
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const playerId = socket.id;
    
    try {
      const { removed, playerInfo } = gameManager.removePlayer(playerId);
      
      if (removed && playerInfo) {
        // Broadcast player disconnected to remaining players
        const disconnectBroadcast = {
          action: 'left' as const,
          playerId,
          playerName: playerInfo.name,
          playerCount: gameManager.getPlayerCount(),
          gameState: gameManager.getGameState(),
          timestamp: Date.now()
        };

        socket.to(HANGMAN_ROOM).emit('hangman:player-action-broadcast', disconnectBroadcast);
        console.log(`Player ${playerInfo.name} disconnected. Broadcasting to room.`);
      }
      
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Debug endpoint to get game stats
  socket.on('hangman:get-stats', () => {
    try {
      const stats = gameManager.getGameStats();
      socket.emit('hangman:stats-response', stats);
    } catch (error) {
      console.error('Error getting stats:', error);
    }
  });
};