// This custom React hook tracks the websocket connection status.
// It returns a boolean indicating if the client is currently connected to the server.
import { useEffect, useState } from "react";
import { socket } from "../socket";

export function useConnection() {
  // isConnected is initialized to the current socket connection state
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Handler for when the socket connects
    const onConnect = () => setIsConnected(true);
    // Handler for when the socket disconnects
    const onDisconnect = () => setIsConnected(false);

    // Register event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Cleanup: remove event listeners when the component unmounts
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return isConnected;
}
