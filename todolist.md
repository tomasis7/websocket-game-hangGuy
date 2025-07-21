# Codebase Fix Priority List

## ✅ CRITICAL - COMPLETED

### 1. Fix TypeScript Build Failure
**Priority**: ✅ COMPLETED  
**File**: `client/src/components/HangGuyGame.tsx:68-69`  
**Issue**: Passing `Set<string>` to components expecting `string[]`  
**Fix Applied**:
```typescript
// Changed lines 68-69 to:
correctGuesses={Array.from(gameState.correctGuesses)}
incorrectGuesses={Array.from(gameState.incorrectGuesses)}
```
**Result**: ✅ Client build now succeeds

### 2. Add Missing CORS Dependency
**Priority**: ✅ COMPLETED  
**File**: `server/package.json`  
**Issue**: Server imports `cors` but it's not in dependencies  
**Fix Applied**:
```bash
cd server && npm install cors
```
**Result**: ✅ CORS dependency added, server starts successfully

### 3. Fix Server Port Conflict
**Priority**: ✅ COMPLETED  
**File**: `server/src/index.ts:44`  
**Issue**: Server and client both use port 3000  
**Fix Applied**:
```typescript
// Changed to:
const PORT = process.env.PORT || 3001;
```
**Result**: ✅ Server now runs on port 3001, no port conflict

### 4. Fix Client Socket Connection Port
**Priority**: ✅ COMPLETED  
**File**: `client/src/socket.ts:8`  
**Issue**: Client connecting to port 3000 instead of 3001  
**Fix Applied**:
```typescript
// Changed from:
export const socket: Socket<any, any> = io("http://localhost:3000", {

// To:
export const socket: Socket<any, any> = io("http://localhost:3001", {
```
**Result**: ✅ Client now connects to correct server port

### 5. Fix Remaining Guesses Display Issue
**Priority**: ✅ COMPLETED  
**File**: `client/src/components/MultiplayerHangGuy.tsx:224`  
**Issue**: GameStatus component not receiving remainingGuesses prop, showing "0 guesses remaining"  
**Fix Applied**:
```typescript
// Changed from:
<GameStatus status={gameState.status} />

// To:
<GameStatus 
  status={gameState.status} 
  word={gameState.word}
  remainingGuesses={gameState.remainingGuesses}
/>
```
**Root Cause**: Missing prop caused `remainingGuesses || 0` to evaluate to 0
**Result**: ✅ Game now shows correct remaining guesses (8 initially)

## ✅ HIGH PRIORITY - COMPLETED

### 6. Fix Cross-Platform Import Paths
**Priority**: ✅ COMPLETED  
**Files**: 
- `server/src/gameManager.ts:1`
- `server/src/broadcastHandlers.ts:4-7` 
- `server/src/gameStateSync.ts:3`
**Issue**: Server imports from `../../client/src/` breaks deployment  
**Fix Applied**: Moved shared types to `shared/` directory and updated imports
```typescript
// Changed from:
import { GameStateEvent } from "../../client/src/types/socketTypes";

// To:
import { GameStateEvent } from "../../shared/types";
```
**Result**: ✅ Server and client builds succeed, deployment-ready imports

### 7. Standardize Data Types Across Client/Server
**Priority**: ✅ COMPLETED  
**Files**: Multiple game logic files  
**Issue**: Server uses `Set<string>`, client expects `string[]`  
**Fix Applied**: `GameManager.getGameState()` already returns arrays correctly:
```typescript
return {
  // ... other fields
  guessedLetters: Array.from(state.guessedLetters),
  correctGuesses: Array.from(state.correctGuesses),  
  incorrectGuesses: Array.from(state.incorrectGuesses),
  // ... other fields
};
```
**Result**: ✅ Data types are consistent across client/server boundary

### 8. Fix Player Name Logic
**Priority**: ✅ COMPLETED  
**Files**: 
- `client/src/hooks/useMultiplayerGame.ts:153`
- `client/src/components/MultiplayerHangGuy.tsx:97,153`  
**Issue**: All players get hardcoded "Player" name  
**Fix Applied**: Implemented proper player name handling:
```typescript
// Hook now accepts player name parameter:
joinGame: (playerName?: string) => {
  const finalPlayerName = playerName || `Player${Math.random().toString(36).substr(2, 4)}`;
  socket.emit("hangman:join-game", { playerName: finalPlayerName });
}

// Component stores player name for retries:
setLastUsedPlayerName(nickname);
```
**Result**: ✅ Players can set custom names via UserJoinDialog, with proper retry logic

## ✅ MEDIUM PRIORITY - COMPLETED

### 9. Fix Client Security Vulnerabilities
**Priority**: ✅ COMPLETED  
**File**: `client/package.json`  
**Issue**: 2 vulnerabilities (1 low, 1 high)  
**Fix Applied**: 
```bash
cd client && npm audit fix
```
**Result**: ✅ All security vulnerabilities resolved (0 vulnerabilities found)

### 10. Add Error Boundaries & Connection Handling
**Priority**: ✅ COMPLETED  
**Files**: 
- `client/src/components/ErrorBoundary.tsx` (new)
- `client/src/components/ConnectionStatus.tsx` (new)
- `client/src/app.tsx` (updated)
- `client/src/socket.ts` (enhanced)
**Issue**: No graceful error handling for Socket.IO failures  
**Fix Applied**: 
- Added React ErrorBoundary component with error details and refresh option
- Created ConnectionStatus component with reconnection UI and manual retry
- Enhanced socket.ts with robust reconnection settings (10 attempts, backoff, fallback to polling)
- Integrated error boundary and connection status into main App component
**Result**: ✅ App now handles React errors and Socket.IO disconnections gracefully

### 11. Improve Socket Event Consistency  
**Priority**: ✅ COMPLETED  
**Files**: 
- `client/src/components/MultiplayerHangGuy.tsx`
- `server/src/broadcastHandlers.ts`
- `server/src/socketHandlers.ts`
**Issue**: Mismatched event payloads between client and server  
**Fix Applied**:
- Standardized error events: `hangman:join-error` → `hangman:error` 
- Removed unused `hangman:game-state` listener in client
- Fixed legacy `hangman:guess-result` → `hangman:guess-broadcast` in socketHandlers.ts
- Fixed legacy `hangman:game-started` → `hangman:game-start-broadcast` in socketHandlers.ts
- Updated all imports to use shared types from `../../shared/types`
**Result**: ✅ All socket events now match the shared HangGuySocketEvents interface

## 🟢 LOW PRIORITY - Code Quality

### 10. Add TypeScript Strict Mode
**Priority**: 🟢 LOW  
**Files**: `tsconfig.json` files  
**Issue**: Missing strict type checking  
**Fix**: Enable strict mode in TypeScript configs

### 11. Add Linting Rules
**Priority**: 🟢 LOW  
**Files**: ESLint configs  
**Issue**: Inconsistent code style  
**Fix**: Configure stricter ESLint rules

### 12. Add Unit Tests
**Priority**: 🟢 LOW  
**Files**: Test files to be created  
**Issue**: No automated testing  
**Fix**: Add Jest/Vitest tests for core game logic

---

## Quick Start Fix Order

For fastest working application:

1. **Fix TypeScript build** → App can compile
2. **Add CORS dependency** → Server can start  
3. **Fix port conflict** → Both client and server can run together
4. **Fix import paths** → Production deployment works
5. **Standardize data types** → Game state synchronizes correctly

After these 5 fixes, you should have a fully functional multiplayer hangman game.

---

## Commands to Test Fixes

```bash
# Test client build
cd client && npm run build

# Test server start  
cd server && npm run dev

# Test full application
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
# Browser: http://localhost:3000
```