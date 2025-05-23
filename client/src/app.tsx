// This file defines the main App component for the client-side React application.
// It imports UI components and a custom hook to manage the number of likes.
// The App component renders a centered UI with a connection label and a clickable droplet.
// When the droplet is clicked, it emits a 'like' event to the server via the socket connection.
import ConnectLabel from "./components/connect-label";
import Droplet from "./components/droplet";
import { useLikes } from "./hooks/use-likes";
import { socket } from "./socket";

export default function App() {
  // useLikes is a custom hook that subscribes to the 'like' event and returns the current like count
  const likes = useLikes();

  // handleClick emits a 'like' event to the server when the droplet is clicked
  const handleClick = () => socket.emit("like");

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-200 to-blue-500">
      {/* ConnectLabel shows the connection status to the user */}
      <ConnectLabel />
      {/* Droplet is a clickable component that displays the number of likes */}
      <Droplet onClick={handleClick}>{likes}</Droplet>
    </div>
  );
}
