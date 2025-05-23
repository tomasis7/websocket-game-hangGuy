### PRD Product Requirements Document

## Client and server will be implemented using React, Typescript, and Tailwind CSS for the client-side and Node.js, Typescript, and Socket.IO for the server-side.

#### Progress Update (as of May 23, 2025)

**What has been implemented:**

- Project setup with React, TypeScript, Tailwind CSS (frontend) and Node.js, TypeScript, Socket.IO (backend).
- Websocket connection established between client and server using Socket.IO.
- Real-time demo event ("like" button) synchronizes state across all connected users.
- Connection status indicator in the UI.
- Shared TypeScript types for websocket events.

**What is not yet implemented:**

- "Hang Guy" game logic (word selection, guesses, game state, etc.).
- SVG images for hangman stages (9 total).
- UI and logic for letter guessing, showing guessed letters, and remaining guesses.
- Keyboard input handling for guesses.
- Display of underscores for unguessed letters.
- Multi-user synchronized game state for "Hang Guy".
- Chat and notification features.

---

### User Stories

- As a user, I want to be play a game called "Hang Guy" also allow other users to play with me via Websocket.
- A sequences of images in SVG format that will be used to create the game. 9 images in total.
- The game will be played in a web browser, and the user will be able to play with other users in real-time.
- Random letter will be selected from a list of letters, and the user will have to guess the letter.
- The user will be able to see the letters that have been guessed so far, and the number of guesses remaining.
- The user uses keyboard to input their guess.
- Empty letters will be displayed as underscores. Input Text will be used to get input from the user.

---

### TODO List to Complete User Stories

1. **Game Logic**

   - [x] Implement "Hang Guy" game logic (word selection, guesses, win/loss state, reset).
   - [x] Create logic for random word/letter selection from a predefined list.
   - [x] Track guessed letters and remaining guesses.
   - [x] Handle correct and incorrect guesses, update game state accordingly.

2. **SVG Images**

   - [x] Design or import 9 SVG images representing each hangman stage.
   - [x] Integrate SVG images into the UI to reflect the current game state.

3. **Frontend UI**

   - [x] Display underscores for unguessed letters and reveal correct guesses.
   - [x] Show guessed letters and remaining guesses.
   - [x] Create input field or keyboard handler for letter guesses.
   - [x] Display game status (in progress, won, lost).
   - [x] Add UI for resetting or starting a new game.

4. **Websocket Integration**

   - [x] Synchronize game state across all connected users in real-time using Socket.IO.
   - [x] Broadcast guesses and game state updates to all clients.
   - [x] Handle new users joining an ongoing game (sync state).

5. **Multi-user Support**

   - [ ] Allow multiple users to play together in the same game session.
   - [ ] Optionally, implement user identification (nickname or session ID).

6. **Chat & Notifications**

   - [ ] Implement a simple chat feature for players to communicate.
   - [ ] Show notifications for game events (e.g., user joined, correct/incorrect guess).

7. **Testing & Polish**
   - [ ] Write unit and integration tests for game logic and websocket events.
   - [ ] Test UI/UX for responsiveness and accessibility.
   - [ ] Polish UI with Tailwind CSS for a clean look.

---
