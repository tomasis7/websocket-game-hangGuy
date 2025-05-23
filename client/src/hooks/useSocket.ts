import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
// Define the server URL - adjust as needed for your environment
const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_SERVER_URL || "http://localhost:3001";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketIo = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    // Set socket in state
    setSocket(socketIo);

    // Clean up on unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};
