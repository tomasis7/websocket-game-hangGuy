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
    // Reconnection lifecycle events are emitted by the Manager, not the Socket.
    socket.io.on('reconnect_attempt', handleReconnectAttempt);
    socket.io.on('reconnect_error', handleReconnectError);
    socket.io.on('reconnect_failed', handleReconnectFailed);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.io.off('reconnect_attempt', handleReconnectAttempt);
      socket.io.off('reconnect_error', handleReconnectError);
      socket.io.off('reconnect_failed', handleReconnectFailed);
      if (dismissTimerRef.current) {clearTimeout(dismissTimerRef.current);}
    };
  }, [onConnectionLost, onConnectionRestored, reconnectAttempts]);

  const handleManualReconnect = () => {
    if (!socket.connected) {socket.connect();}
  };

  if (dismissed) {return null;}

  // Disconnected toast
  if (!isConnected) {
    return (
      <div
        role="alert"
        className="fixed bottom-4 right-4 z-50 animate-toast max-w-sm px-4 py-3 flex items-center gap-3 border-[1.5px] bg-surface text-ink"
        style={{ borderColor: 'var(--ink)' }}
      >
        <span
          className="w-2.5 h-2.5 flex-shrink-0"
          style={{ background: 'var(--ink)', animation: isReconnecting ? 'spin 1s linear infinite' : undefined }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="font-mono font-semibold text-sm leading-tight uppercase tracking-[0.04em]">
            {isReconnecting ? `Reconnecting (${reconnectAttempts})` : 'Connection lost'}
          </p>
          {!isReconnecting && lastDisconnectReason && (
            <p className="font-mono text-xs text-muted truncate">{lastDisconnectReason}</p>
          )}
        </div>
        {!isReconnecting && (
          <button
            onClick={handleManualReconnect}
            className="flex-shrink-0 font-mono text-xs font-bold uppercase tracking-[0.04em] px-2.5 py-1.5 bg-accent text-accent-ink"
          >
            Retry
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 text-muted hover:text-ink text-lg leading-none"
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
        className="fixed bottom-4 right-4 z-50 animate-toast max-w-sm px-4 py-3 flex items-center gap-3 bg-accent text-accent-ink"
      >
        <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: 'var(--accent-ink)' }} aria-hidden="true" />
        <p className="font-mono font-semibold text-sm uppercase tracking-[0.04em]">Connection restored</p>
      </div>
    );
  }

  return null;
};
