import { useState, useEffect, useCallback } from "react";
import { socket } from "../socket";
import type {
  User,
  SessionInfo,
  UserIdentification,
  JoinGameRequest,
  JoinGameResponse,
  ReconnectResponse,
} from "../../../shared/types";

interface SavedSessionData {
  userId: string;
  sessionId: string;
  nickname: string;
}

interface UseUserIdentificationReturn {
  currentUser: User | null;
  users: User[];
  sessionInfo: SessionInfo | null;
  userIdentification: UserIdentification | null;
  joinError: string;
  isJoining: boolean;
  joinGame: (nickname: string, sessionId?: string, avatar?: string) => void;
  leaveGame: () => void;
  attemptReconnect: () => void;
}

export const useUserIdentification = (): UseUserIdentificationReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [userIdentification, setUserIdentification] =
    useState<UserIdentification | null>(null);
  const [joinError, setJoinError] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Generate unique user ID with proper typing
  const generateUserId = useCallback((): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Join game with proper error handling
  const joinGame = useCallback(
    (nickname: string, sessionId?: string, avatar?: string): void => {
      if (!socket) {
        setJoinError("Socket connection not available");
        return;
      }

      if (!nickname.trim()) {
        setJoinError("Nickname is required");
        return;
      }

      setIsJoining(true);
      setJoinError("");

      const userId = generateUserId();
      const joinRequest: JoinGameRequest & { userId: string } = {
        nickname: nickname.trim(),
        sessionId: sessionId?.trim(),
        avatar,
        userId,
      };

      // Store user info locally with proper typing
      const userInfo: UserIdentification = {
        userId,
        nickname: nickname.trim(),
        sessionId: sessionId?.trim() || "",
        isHost: !sessionId, // Host if creating new session
      };

      setUserIdentification(userInfo);

      // Emit join game event
      socket.emit("joinGame", joinRequest);

      // Set timeout for join response
      const joinTimeout = setTimeout(() => {
        setIsJoining(false);
        setJoinError("Join request timed out. Please try again.");
      }, 10000);

      // Listen for join response with proper typing
      const handleJoinResponse = (response: JoinGameResponse): void => {
        clearTimeout(joinTimeout);
        setIsJoining(false);

        if (response.success && response.user && response.session) {
          setCurrentUser(response.user);
          setSessionInfo(response.session);
          setUserIdentification({
            ...userInfo,
            sessionId: response.session.id,
            isHost: response.session.hostUserId === response.user.id,
          });

          // Save session info to localStorage for reconnection
          const savedSession: SavedSessionData = {
            userId: response.user.id,
            sessionId: response.session.id,
            nickname: response.user.nickname,
          };
          localStorage.setItem(
            "hangGuy_lastSession",
            JSON.stringify(savedSession)
          );
        } else {
          setJoinError(response.error || "Failed to join game");
          setCurrentUser(null);
          setSessionInfo(null);
          setUserIdentification(null);
        }
      };

      socket.once("joinGameResponse", handleJoinResponse);
    },
    [generateUserId]
  );

  // Leave game with proper cleanup
  const leaveGame = useCallback((): void => {
    if (!socket || !currentUser) {return;}

    socket.emit("leaveGame", { userId: currentUser.id });

    setCurrentUser(null);
    setUsers([]);
    setSessionInfo(null);
    setUserIdentification(null);

    // Clear saved session
    localStorage.removeItem("hangGuy_lastSession");
  }, [currentUser]);

  // Attempt to reconnect to previous session
  const attemptReconnect = useCallback((): void => {
    const savedSessionString = localStorage.getItem("hangGuy_lastSession");
    if (savedSessionString && socket) {
      try {
        const sessionData: SavedSessionData = JSON.parse(savedSessionString);
        // Validate required fields
        if (
          sessionData.userId &&
          sessionData.sessionId &&
          sessionData.nickname
        ) {
          socket.emit("reconnectToSession", sessionData);
        } else {
          localStorage.removeItem("hangGuy_lastSession");
        }
      } catch (error) {
        console.error("Failed to parse saved session:", error);
        localStorage.removeItem("hangGuy_lastSession");
      }
    }
  }, []);

  // Socket event listeners with proper typing
  useEffect(() => {
    if (!socket) {return;}

    const handleUserJoined = (user: User): void => {
      setUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== user.id);
        return [...filtered, user];
      });
    };

    const handleUserLeft = (userId: string): void => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const handleUserListUpdated = (userList: User[]): void => {
      setUsers(userList);
    };

    const handleSessionUpdated = (session: SessionInfo): void => {
      setSessionInfo(session);
    };

    const handleReconnectResponse = (response: ReconnectResponse): void => {
      if (response.success && response.user && response.session) {
        setCurrentUser(response.user);
        setSessionInfo(response.session);
        setUserIdentification({
          userId: response.user.id,
          nickname: response.user.nickname,
          sessionId: response.session.id,
          isHost: response.session.hostUserId === response.user.id,
        });
      } else {
        localStorage.removeItem("hangGuy_lastSession");
        if (response.error) {
          setJoinError(response.error);
        }
      }
    };

    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("userListUpdated", handleUserListUpdated);
    socket.on("sessionUpdated", handleSessionUpdated);
    socket.on("reconnectResponse", handleReconnectResponse);

    // Attempt reconnect on mount
    attemptReconnect();

    return (): void => {
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("userListUpdated", handleUserListUpdated);
      socket.off("sessionUpdated", handleSessionUpdated);
      socket.off("reconnectResponse", handleReconnectResponse);
    };
  }, [attemptReconnect]);

  return {
    currentUser,
    users,
    sessionInfo,
    userIdentification,
    joinError,
    isJoining,
    joinGame,
    leaveGame,
    attemptReconnect,
  };
};
