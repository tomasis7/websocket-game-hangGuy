import { Server, Socket } from "socket.io";
import { MultiplayerHangmanGame } from "./hangmanGame";
import { HangGuySocketEvents } from "../../shared/types";
import { UserManager } from "./userManager";

const hangmanGame = new MultiplayerHangmanGame();

export class SocketHandlers {
  private userManager = new UserManager();
  gameStateSynchronizer: any;

  setupHandlers(io: Server): void {
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Handle user joining game
      socket.on("joinGame", ({ nickname, sessionId = "default" }) => {
        try {
          const user = this.userManager.createUser(socket.id, nickname);
          const session = this.userManager.addUserToSession(user.id, sessionId);

          socket.join(sessionId);

          // Send session info to new user
          socket.emit("sessionInfo", {
            id: session.id,
            userCount: session.users.length,
          });

          // Broadcast user joined to others in session
          socket.to(sessionId).emit("userJoined", user);

          // Send updated user list to all users in session
          io.to(sessionId).emit("userListUpdated", session.users);

          // Sync game state for new user
          const gameSummary = this.gameStateSynchronizer.getGameSummary();
          socket.emit("gameStateSync", gameSummary);

          console.log(`User ${user.nickname} joined session ${sessionId}`);
        } catch (error) {
          console.error("Error joining game:", error);
          socket.emit("error", "Failed to join game");
        }
      });

      // Handle user leaving game
      socket.on("leaveGame", () => {
        this.handleUserDisconnect(socket);
      });

      // Handle get user list
      socket.on("getUserList", () => {
        const user = this.userManager.getUserBySocketId(socket.id);
        if (user) {
          const sessions = this.userManager.getAllActiveSessions();
          const userSession = sessions.find((s) =>
            s.users.some((u) => u.id === user.id)
          );
          if (userSession) {
            socket.emit("userListUpdated", userSession.users);
          }
        }
      });

      // Handle letter guess
      socket.on("hangman:guess-letter", (data) => {
        const playerId = socket.id;

        try {
          // Validate guess
          const canGuess = hangmanGame.canPlayerGuess(playerId, data.letter);
          if (!canGuess.canGuess) {
            socket.emit("hangman:error", {
              message: canGuess.reason || "Cannot make guess",
              code: "INVALID_GUESS",
            });
            return;
          }

          // Process the guess
          const result = hangmanGame.processGuess(data.letter, playerId);

          // Broadcast result to all players in the room
          io.to("hangman-room").emit("hangman:guess-broadcast", {
            letter: data.letter,
            isCorrect: result.isCorrect,
            playerId,
            playerName: data.playerName,
            gameState: result.gameState,
          });

          console.log(
            `Player ${playerId} guessed "${data.letter}" - ${
              result.isCorrect ? "Correct" : "Incorrect"
            }`
          );
        } catch (error) {
          console.error("Error processing guess:", error);
          socket.emit("hangman:error", {
            message: "Failed to process guess",
            code: "GUESS_ERROR",
          });
        }
      });

      // Start new game
      socket.on("hangman:new-game", (data) => {
        const playerId = socket.id;

        try {
          const gameState = hangmanGame.startNewGame(data);

          // Broadcast new game to all players
          io.to("hangman-room").emit("hangman:game-start-broadcast", {
            startedBy: playerId,
            gameState,
          });

          console.log(`New game started by player ${playerId}`);
        } catch (error) {
          console.error("Error starting new game:", error);
          socket.emit("hangman:error", {
            message: "Failed to start new game",
            code: "NEW_GAME_ERROR",
          });
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        this.handleUserDisconnect(socket);
      });
    });

    // Cleanup inactive sessions every 5 minutes
    setInterval(() => {
      this.userManager.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  private handleUserDisconnect(socket: Socket): void {
    const user = this.userManager.getUserBySocketId(socket.id);
    if (user) {
      const sessions = this.userManager.getAllActiveSessions();
      const userSession = sessions.find((s) =>
        s.users.some((u) => u.id === user.id)
      );

      this.userManager.removeUser(user.id);

      if (userSession) {
        // Notify remaining users
        socket.to(userSession.id).emit("userLeft", user.id);
        socket.to(userSession.id).emit("userListUpdated", userSession.users);

        console.log(`User ${user.nickname} left session ${userSession.id}`);
      }
    }

    console.log("User disconnected:", socket.id);
  }
}
