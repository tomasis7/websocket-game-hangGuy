import React, { useState } from 'react';

interface UserJoinDialogProps {
  onJoin: (nickname: string, sessionId?: string) => void;
  isVisible: boolean;
}

export const UserJoinDialog: React.FC<UserJoinDialogProps> = ({ onJoin, isVisible }) => {
  const [nickname, setNickname] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onJoin(nickname.trim(), sessionId.trim() || undefined);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Hang Guy Game</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
              Your Nickname *
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your nickname"
              maxLength={20}
              required
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {showAdvanced && (
            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-1">
                Session ID (optional)
              </label>
              <input
                type="text"
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for default session"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the same Session ID to join friends in a specific game room
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};