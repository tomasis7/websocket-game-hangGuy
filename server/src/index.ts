import { Server } from "socket.io";
import { createServer } from "http";
import { setupHangmanHandlers } from "./socketHandlers";

const server = createServer();
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Setup hangman game handlers
  setupHangmanHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

export default io;
