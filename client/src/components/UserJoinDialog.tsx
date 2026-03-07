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
  const [selectedAvatar, setSelectedAvatar] = useState("🎮");

  const avatarOptions = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸", "🎵"];

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

    localStorage.setItem("hangGuy_nickname", nickname.trim());
    onJoin(nickname.trim(), undefined, selectedAvatar);
  };

  if (!isVisible) {return null;}

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
            <label
              htmlFor="nickname-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nickname *
            </label>
            <input
              id="nickname-input"
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
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Avatar selection">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={`avatar-${index}`}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  aria-label={`Select avatar ${avatar}`}
                  aria-pressed={selectedAvatar === avatar}
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

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Join Game
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
