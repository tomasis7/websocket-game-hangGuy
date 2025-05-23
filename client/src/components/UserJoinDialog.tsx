import React, { useState, useEffect } from "react";

interface UserJoinDialogProps {
  onJoin: (nickname: string, sessionId?: string, avatar?: string) => void;
  isVisible: boolean;
  error?: string;
}

export const UserJoinDialog: React.FC<UserJoinDialogProps> = ({
  onJoin,
  isVisible,
  error,
}) => {
  const [nickname, setNickname] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [joinMode, setJoinMode] = useState<"new" | "existing">("new");
  const [selectedAvatar, setSelectedAvatar] = useState("🎮");

  const avatarOptions = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎪", "🎸"];

  // Load saved nickname from localStorage
  useEffect(() => {
    const savedNickname = localStorage.getItem("hangGuy_nickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      return;
    }

    // Save nickname for future sessions
    localStorage.setItem("hangGuy_nickname", nickname.trim());

    const sessionIdToJoin =
      joinMode === "existing" ? sessionId.trim() : undefined;
    onJoin(nickname.trim(), sessionIdToJoin, selectedAvatar);
  };

  const generateRandomSessionId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSessionId(result);
    setJoinMode("existing");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Join Hang Guy
          </h2>
          <p className="text-gray-600">Enter your details to start playing!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nickname *
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be visible to other players
            </p>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                    selectedAvatar === avatar
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Join Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Game Session
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="joinMode"
                  value="new"
                  checked={joinMode === "new"}
                  onChange={() => setJoinMode("new")}
                  className="mr-2"
                />
                <span className="text-sm">Create new game session</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="joinMode"
                  value="existing"
                  checked={joinMode === "existing"}
                  onChange={() => setJoinMode("existing")}
                  className="mr-2"
                />
                <span className="text-sm">Join existing session</span>
              </label>
            </div>
          </div>

          {/* Session ID Input */}
          {joinMode === "existing" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  placeholder="Enter session ID"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  pattern="[A-Z0-9]{6}"
                />
                <button
                  type="button"
                  onClick={generateRandomSessionId}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  title="Generate random session ID"
                >
                  🎲
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                6 characters (A-Z, 0-9). Ask other players for their session ID.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {joinMode === "new" ? "Create & Join Game" : "Join Game"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Your nickname will be saved for future sessions
          </p>
        </div>
      </div>
    </div>
  );
};
