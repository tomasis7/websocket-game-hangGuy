import React, { useState, useEffect, useRef } from 'react';
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setLastDisconnectReason(null);
      setDismissed(false);
      if (reconnectAttempts > 0) {
        setShowSuccess(true);
        dismissTimerRef.current = setTimeout(() => {
          setShowSuccess(false);
          setReconnectAttempts(0);
        }, 3000);
      }
      onConnectionRestored?.();
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      setDismissed(false);
      setLastDisconnectReason(reason);
      onConnectionLost?.();
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      setReconnectAttempts(attemptNumber);
      setIsReconnecting(true);
    };

    const handleReconnectError = () => setIsReconnecting(false);
    const handleReconnectFailed = () => setIsReconnecting(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('reconnect_failed', handleReconnectFailed);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('reconnect_failed', handleReconnectFailed);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [onConnectionLost, onConnectionRestored, reconnectAttempts]);

  const handleManualReconnect = () => {
    if (!socket.connected) socket.connect();
  };

  if (dismissed) return null;

  // Disconnected toast
  if (!isConnected) {
    return (
      <div
        role="alert"
        className="fixed bottom-4 right-4 z-50 animate-slide-up max-w-sm rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: 'var(--danger)',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(244,63,94,0.4)',
        }}
      >
        <span className="text-lg flex-shrink-0" aria-hidden="true">
          {isReconnecting ? '↻' : '⚠'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">
            {isReconnecting ? `Reconnecting… (${reconnectAttempts})` : 'Connection Lost'}
          </p>
          {!isReconnecting && lastDisconnectReason && (
            <p className="text-xs opacity-80 truncate">{lastDisconnectReason}</p>
          )}
        </div>
        {!isReconnecting && (
          <button
            onClick={handleManualReconnect}
            className="flex-shrink-0 text-xs font-bold underline hover:no-underline focus:outline-none"
          >
            Retry
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 opacity-70 hover:opacity-100 focus:outline-none text-lg leading-none"
        >
          ×
        </button>
      </div>
    );
  }

  // Reconnected success toast
  if (isConnected && showSuccess) {
    return (
      <div
        role="status"
        className="fixed bottom-4 right-4 z-50 animate-slide-up max-w-sm rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: 'var(--success)',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(132,204,22,0.4)',
        }}
      >
        <span className="text-lg" aria-hidden="true">✓</span>
        <p className="font-semibold text-sm">Connection Restored</p>
      </div>
    );
  }

  return null;
};
