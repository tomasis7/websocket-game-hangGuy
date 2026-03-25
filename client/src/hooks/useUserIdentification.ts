import { useState, useCallback } from "react";
import { socket } from "../socket";
import type { User } from "../../../shared/types";

interface UseUserIdentificationReturn {
  currentUser: User | null;
  joinError: string;
  isJoining: boolean;
  joinGame: (nickname: string) => void;
  leaveGame: () => void;
}

export const useUserIdentification = (): UseUserIdentificationReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [joinError, setJoinError] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const joinGame = useCallback((nickname: string): void => {
    if (!nickname.trim()) {
      setJoinError("Nickname is required");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    const user: User = {
      id: socket.id ?? `user_${Date.now()}`,
      nickname: nickname.trim(),
      joinedAt: Date.now(),
      isActive: true,
    };

    setCurrentUser(user);
    localStorage.setItem("hangGuy_nickname", nickname.trim());
    setIsJoining(false);
  }, []);

  const leaveGame = useCallback((): void => {
    socket.emit("hangman:leave-game");
    setCurrentUser(null);
    localStorage.removeItem("hangGuy_nickname");
  }, []);

  return {
    currentUser,
    joinError,
    isJoining,
    joinGame,
    leaveGame,
  };
};
