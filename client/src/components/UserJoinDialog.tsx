import React, { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface UserJoinDialogProps {
  onJoin: (nickname: string, sessionId?: string, avatar?: string) => void;
  isVisible: boolean;
  error?: string;
}

const AVATARS = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸", "🎵"];

export const UserJoinDialog: React.FC<UserJoinDialogProps> = ({
  onJoin,
  isVisible,
  error,
}) => {
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🎮");
  const [validationError, setValidationError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hangGuy_nickname");
    if (saved) {setNickname(saved);}
  }, []);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isVisible]);

  useFocusTrap(containerRef, isVisible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setValidationError("Please enter a nickname");
      return;
    }
    setValidationError("");
    localStorage.setItem("hangGuy_nickname", nickname.trim());
    onJoin(nickname.trim(), undefined, selectedAvatar);
  };

  if (!isVisible) {return null;}

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-white sm:bg-zinc-50 overflow-y-auto"
      style={{
        background: 'var(--bg)',
      }}
    >
      <div className="flex-1 flex flex-col justify-center items-center p-6 w-full max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div
            className="text-6xl mb-4 animate-bounce-in"
            style={{ fontFamily: "'Fredoka One', cursive" }}
            aria-hidden="true"
          >
            {selectedAvatar}
          </div>
          <h1
            className="text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--accent)' }}
          >
            Hang Guy
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Choose an avatar and enter your name to jump in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 bg-white sm:shadow-sm sm:border sm:rounded-3xl p-6" style={{ borderColor: 'var(--border)' }}>
          <div>
            <label
              htmlFor="nickname-input"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              Your Name
            </label>
            <input
              ref={inputRef}
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={e => {
                setNickname(e.target.value);
                setValidationError("");
              }}
              placeholder="e.g. Hangman Hero"
              maxLength={20}
              required
              autoComplete="nickname"
              className="w-full px-5 py-4 rounded-2xl text-lg outline-none transition-all focus-visible:ring-2 bg-zinc-50"
              style={{
                border: `1.5px solid ${validationError ? 'var(--danger)' : 'var(--border)'}`,
                color: 'var(--text)',
                background: 'var(--bg-surface)'
              }}
              aria-describedby={validationError ? 'nickname-error' : undefined}
            />
            {validationError && (
              <p id="nickname-error" className="text-sm mt-2" style={{ color: 'var(--danger)' }} role="alert">
                {validationError}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Select Avatar
            </p>
            <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Avatar selection">
              {AVATARS.map((avatar, i) => (
                <button
                  key={`avatar-${i}`}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  aria-label={`Select avatar ${avatar}`}
                  aria-pressed={selectedAvatar === avatar}
                  className="text-3xl p-3 rounded-2xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 flex justify-center items-center"
                  style={{
                    border: `2px solid ${selectedAvatar === avatar ? 'var(--accent)' : 'transparent'}`,
                    background: selectedAvatar === avatar ? 'rgba(139,92,246,0.1)' : 'var(--bg)',
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {error && (() => {
            const isConnecting = error.startsWith('Connecting');
            return (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium"
                role={isConnecting ? 'status' : 'alert'}
                style={{
                  background: isConnecting ? 'rgba(139,92,246,0.08)' : 'rgba(244,63,94,0.10)',
                  border: `1px solid ${isConnecting ? 'var(--accent)' : 'var(--danger)'}`,
                  color: isConnecting ? 'var(--accent)' : 'var(--danger)',
                }}
              >
                {error}
              </div>
            );
          })()}

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: 'var(--accent)',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem',
              boxShadow: nickname.trim() ? '0 8px 20px rgba(139,92,246,0.3)' : 'none',
            }}
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
};
