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

## 🟡 HIGH PRIORITY - Core Functionality Issues

### 5. Fix Cross-Platform Import Paths
**Priority**: 🟡 HIGH  
**Files**: 
- `server/src/gameManager.ts:1`
- `server/src/broadcastHandlers.ts:4-7` 
- `server/src/gameStateSync.ts:3`
**Issue**: Server imports from `../../client/src/` breaks deployment  
**Fix**: Move shared types to `shared/` directory and update imports
```typescript
// Change from:
import { GameStateEvent } from "../../client/src/types/socketTypes";

// To:
import { GameStateEvent } from "../../shared/types";
```

### 6. Standardize Data Types Across Client/Server
**Priority**: 🟡 HIGH  
**Files**: Multiple game logic files  
**Issue**: Server uses `Set<string>`, client expects `string[]`  
**Fix**: Update `GameManager.getGameState()` to return arrays:
```typescript
return {
  // ... other fields
  guessedLetters: Array.from(state.guessedLetters),
  correctGuesses: Array.from(state.correctGuesses),  
  incorrectGuesses: Array.from(state.incorrectGuesses),
  // ... other fields
};
```

### 7. Fix Player Name Logic
**Priority**: 🟡 HIGH  
**File**: `client/src/hooks/useMultiplayerGame.ts:153`  
**Issue**: All players get hardcoded "Player" name  
**Fix**: Implement proper player name input/generation
```typescript
// Instead of hardcoded:
socket.emit("hangman:join-game", { playerName: "Player" });

// Use dynamic name:
socket.emit("hangman:join-game", { playerName: playerName || generatePlayerName() });
```

## 🔵 MEDIUM PRIORITY - Stability & UX

### 7. Fix Client Security Vulnerabilities
**Priority**: 🔵 MEDIUM  
**File**: `client/package.json`  
**Issue**: 2 vulnerabilities (1 low, 1 high)  
**Fix**:
```bash
cd client && npm audit fix
```

### 8. Add Error Boundaries & Connection Handling
**Priority**: 🔵 MEDIUM  
**Files**: Client components  
**Issue**: No graceful error handling for Socket.IO failures  
**Fix**: Add React Error Boundaries and connection retry logic

### 9. Improve Socket Event Consistency  
**Priority**: 🔵 MEDIUM  
**Files**: Client/Server socket handlers  
**Issue**: Mismatched event payloads between client and server  
**Fix**: Ensure all socket events match interface definitions

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