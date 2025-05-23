import { useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';
import type { User, SessionInfo, UserIdentification, JoinGameRequest } from '../../../shared/types';

export const useUserIdentification = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [userIdentification, setUserIdentification] = useState<UserIdentification | null>(null);
  const [joinError, setJoinError] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  // Generate unique user ID
  const generateUserId = useCallback(() => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Join game with user identification
  const joinGame = useCallback((nickname: string, sessionId?: string, avatar?: string) => {
    if (!socket) {
      setJoinError('Socket connection not available');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    const userId = generateUserId();
    const joinRequest: JoinGameRequest = {
      nickname: nickname.trim(),
      sessionId: sessionId?.trim(),
      avatar,
    };

    // Store user info locally
    const userInfo: UserIdentification = {
      userId,
      nickname: nickname.trim(),
      sessionId: sessionId?.trim() || '',
      isHost: !sessionId, // Host if creating new session
    };

    setUserIdentification(userInfo);

    // Emit join game event
    socket.emit('joinGame', { ...joinRequest, userId });

    // Set timeout for join response
    const joinTimeout = setTimeout(() => {
      setIsJoining(false);
      setJoinError('Join request timed out. Please try again.');
    }, 10000);

    // Listen for join response
    const handleJoinResponse = (response: { success: boolean; error?: string; user?: User; session?: SessionInfo }) => {
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
        localStorage.setItem('hangGuy_lastSession', JSON.stringify({
          userId: response.user.id,
          sessionId: response.session.id,
          nickname: response.user.nickname,
        }));
      } else {
        setJoinError(response.error || 'Failed to join game');
        setCurrentUser(null);
        setSessionInfo(null);
        setUserIdentification(null);
      }
    };

    socket.once('joinGameResponse', handleJoinResponse);
  }, [generateUserId]);

  // Leave game
  const leaveGame = useCallback(() => {
    if (!socket || !currentUser) return;

    socket.emit('leaveGame', { userId: currentUser.id });
    
    setCurrentUser(null);
    setUsers([]);
    setSessionInfo(null);
    setUserIdentification(null);
    
    // Clear saved session
    localStorage.removeItem('hangGuy_lastSession');
  }, [currentUser]);

  // Attempt to reconnect to previous session
  const attemptReconnect = useCallback(() => {
    const savedSession = localStorage.getItem('hangGuy_lastSession');
    if (savedSession && socket) {
      try {
        const sessionData = JSON.parse(savedSession);
        socket.emit('reconnectToSession', sessionData);
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('hangGuy_lastSession');
      }
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (user: User) => {
      setUsers(prev => {
        const filtered = prev.filter(u => u.id !== user.id);
        return [...filtered, user];
      });
    };

    const handleUserLeft = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleUserListUpdated = (userList: User[]) => {
      setUsers(userList);
    };

    const handleSessionUpdated = (session: SessionInfo) => {
      setSessionInfo(session);
    };

    const handleReconnectResponse = (response: { success: boolean; user?: User; session?: SessionInfo; error?: string }) => {
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
        localStorage.removeItem('hangGuy_lastSession');
      }
    };

    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('userListUpdated', handleUserListUpdated);
    socket.on('sessionUpdated', handleSessionUpdated);
    socket.on('reconnectResponse', handleReconnectResponse);

    // Attempt reconnect on mount
    attemptReconnect();

    return () => {
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('userListUpdated', handleUserListUpdated);
      socket.off('sessionUpdated', handleSessionUpdated);
      socket.off('reconnectResponse', handleReconnectResponse);
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