import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

interface ConnectionStatusProps {
  onConnectionLost?: () => void;
  onConnectionRestored?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  onConnectionLost,
  onConnectionRestored,
}) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastDisconnectReason, setLastDisconnectReason] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      setReconnectAttempts(0);
      setIsReconnecting(false);
      setLastDisconnectReason(null);
      onConnectionRestored?.();
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setLastDisconnectReason(reason);
      onConnectionLost?.();
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      console.log(`Reconnection attempt #${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
      setIsReconnecting(true);
    };

    const handleReconnectError = (error: Error) => {
      console.error('Reconnection error:', error);
      setIsReconnecting(false);
    };

    const handleReconnectFailed = () => {
      console.error('Reconnection failed after all attempts');
      setIsReconnecting(false);
    };

    // Socket.IO event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
    };
  }, [onConnectionLost, onConnectionRestored]);

  const handleManualReconnect = () => {
    if (!socket.connected) {
      socket.connect();
    }
  };

  // Show connection status banner when disconnected
  if (!isConnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="animate-pulse">
              {isReconnecting ? '🔄' : '⚠️'}
            </div>
            <div>
              <p className="font-semibold">
                {isReconnecting ? 'Reconnecting...' : 'Connection Lost'}
              </p>
              <p className="text-sm opacity-90">
                {isReconnecting 
                  ? `Attempt ${reconnectAttempts} - Trying to reconnect to the server`
                  : `Disconnected from server${lastDisconnectReason ? ` (${lastDisconnectReason})` : ''}`
                }
              </p>
            </div>
          </div>
          
          {!isReconnecting && (
            <button
              onClick={handleManualReconnect}
              className="bg-white text-red-600 px-4 py-1 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show brief success message when reconnected
  if (isConnected && reconnectAttempts > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 shadow-lg animate-slide-down">
        <div className="max-w-6xl mx-auto flex items-center space-x-3">
          <span>✅</span>
          <p className="font-semibold">Connection Restored</p>
        </div>
      </div>
    );
  }

  return null;
};