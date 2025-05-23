# Hang Guy Game Server

This server is a [Socket.IO server](https://socket.io/docs/v4/server-socket-instance/) that handles the communication for the Hang Guy multiplayer game.

The types for communication can be found in the [shared/types.ts](../shared/types.ts) file and are used in both the server and client projects.

## Installation & Development

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Make sure to also start the client in the client folder

The game server runs on port 3001 and provides the full Hang Guy multiplayer experience.

## Server Structure

- `/src/index.ts` - Main entry point for the game server
- `/src/gameManager.ts` - Manages game state and logic
- `/src/userManager.ts` - Handles user sessions and connections
- `/src/hangmanGame.ts` - Core game logic for Hang Guy
- `/src/socketHandlers.ts` - Socket event handlers
- `/src/broadcastHandlers.ts` - Broadcast message handlers

Do not use the old `server.ts` file in the root directory - it's just a redirection server.
