// This custom React hook manages the number of likes received from the server.
// It listens for the 'like' event from the websocket and increments the like count accordingly.
import { useEffect, useState } from "react";
import { socket } from "../socket";

export function useLikes() {
  // likes stores the current number of likes
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    // onLike increments the like count when a 'like' event is received
    const onLike = () => setLikes((likes) => likes + 1);

    // Register the event listener
    socket.on("like", onLike);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      socket.off("like", onLike);
    };
  }, []);

  return likes;
}
