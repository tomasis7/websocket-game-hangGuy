import { useEffect } from "react";
import { socket } from "../socket";

// We're now using the single socket instance from socket.ts
export const useSocket = () => {
  useEffect(() => {
    // Set up listeners for connection events
    const onConnect = () => {
      console.log("Socket connected ✅");
    };

    const onDisconnect = () => {
      console.log("Socket disconnected ❌");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Clean up listeners on unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return socket;
};
