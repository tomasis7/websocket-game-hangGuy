# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time multiplayer "Hang Guy" game built with React/TypeScript on the client and Node.js/Socket.IO on the server. Players can join game sessions and collaboratively guess letters in a hangman-style word game with synchronized state across all connected clients.

## Commands

### Client Development (in `client/` directory)
- `npm install` - Install dependencies
- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Server Development (in `server/` directory)
- `npm install` - Install dependencies
- `npm run dev` - Start development server with hot reload (runs on port 3000)
- `npm run start` - Start production server

### Development Workflow
1. Start server: `cd server && npm run dev`
2. Start client: `cd client && npm run dev`
3. Both must be running for full multiplayer functionality

## Architecture

### Client Architecture (React/TypeScript)
- **Components**: Game UI components in `client/src/components/`
  - `MultiplayerHangGuy.tsx` - Main multiplayer game component
  - `HangGuyGame.tsx` - Core game component
  - `UserJoinDialog.tsx` - Player joining interface
  - `HangmanSVGs.tsx` - SVG graphics for hangman stages
- **Hooks**: Custom React hooks in `client/src/hooks/`
  - `useMultiplayerGame.ts` - Manages multiplayer game state and Socket.IO events
  - `useUserIdentification.ts` - Handles user session management
  - `useHangGuyGame.ts` - Local game logic hook
- **Game Logic**: Core game mechanics in `client/src/utils/`
  - `gameLogic.ts` - HangGuyGame class with game state management
  - `guessHandler.ts` - Letter guess processing logic
  - `wordSelection.ts` - Random word selection

### Server Architecture (Node.js/Socket.IO)
- **Entry Point**: `server/src/index.ts` - Express server + Socket.IO setup
- **Core Modules**:
  - `gameManager.ts` - GameManager class managing multiplayer game state
  - `userManager.ts` - User session and connection management
  - `socketHandlers.ts` - Socket.IO event handlers
  - `broadcastHandlers.ts` - Real-time event broadcasting
  - `gameStateSync.ts` - Game state synchronization logic

### Socket Events Architecture
Events follow the pattern `hangman:[action]` for game-specific communications:
- Client→Server: `hangman:join-game`, `hangman:guess-letter`, `hangman:new-game`
- Server→Client: `hangman:state-broadcast`, `hangman:guess-broadcast`, `hangman:join-success`

### Shared Types
- `shared/types.ts` - Core interfaces (User, SessionInfo, GameStateEvent)
- `client/src/types/socketTypes.ts` - Socket event type definitions
- `client/src/types/gameTypes.ts` - Game state and logic types

## Key Design Patterns

### State Management
- Client uses React hooks for local state and Socket.IO event handling
- Server maintains authoritative game state via GameManager class
- Real-time synchronization via Socket.IO broadcasts

### Game State Flow
1. Players join via `UserJoinDialog` → creates user session
2. Game state managed by server `GameManager` class
3. Letter guesses processed server-side and broadcast to all clients
4. Client components react to state updates via hook subscriptions

### Multiplayer Synchronization
- New players joining ongoing games receive current state
- All game actions (guesses, new games) broadcast to all connected players
- Game logic centralized on server to prevent desynchronization

## Development Notes

- Uses Socket.IO for WebSocket communication with CORS configured for localhost:3000
- Client built with Vite + React + TypeScript + Tailwind CSS
- Server uses tsx for TypeScript execution with hot reload
- Shared type definitions ensure type safety across client-server boundary
- Game supports multiple concurrent players with real-time updates