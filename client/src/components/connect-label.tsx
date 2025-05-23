// This component displays the connection status to the websocket server.
// It uses the useConnection hook to determine if the client is connected.
import { useConnection } from "../hooks/use-connection";

export default function ConnectLabel() {
  // isConnected is a boolean indicating the websocket connection status
  const isConnected = useConnection();

  return (
    <span className="fixed left-2 bottom-2 text-2xl text-blue-950">
      {/* Show a lightning bolt if connected, otherwise a stop sign */}
      {isConnected ? "⚡️ Connected" : "🚫 Not Connected"}
    </span>
  );
}
