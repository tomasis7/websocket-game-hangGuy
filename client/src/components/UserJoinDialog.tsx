import React, { useState, useEffect, useRef, useCallback } from "react";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingId = "join-dialog-title";

  useEffect(() => {
    const saved = localStorage.getItem("hangGuy_nickname");
    if (saved) setNickname(saved);
  }, []);

  // Focus first focusable element on open
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isVisible]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return; // no dismiss on Escape for join dialog (required)

    if (e.key === 'Tab') {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, []);

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

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby={headingId}
    >
      <div
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        className="w-full sm:max-w-md animate-bounce-in"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem 1.5rem 0 0',
          padding: '2rem 1.5rem 2.5rem',
        }}
        // Mobile bottom sheet, desktop centered card
      >
        {/* Drag handle on mobile */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-6 sm:hidden"
          style={{ background: 'var(--border)' }}
          aria-hidden="true"
        />

        <div className="text-center mb-6">
          <div
            className="text-5xl mb-3"
            style={{ fontFamily: "'Fredoka One', cursive" }}
            aria-hidden="true"
          >
            {selectedAvatar}
          </div>
          <h2
            id={headingId}
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--accent)' }}
          >
            Join Hang Guy
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Enter your details to start playing!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nickname input */}
          <div>
            <label
              htmlFor="nickname-input"
              className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--text)' }}
            >
              Nickname <span aria-hidden="true" style={{ color: 'var(--danger)' }}>*</span>
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
              placeholder="Enter your nickname"
              maxLength={20}
              required
              autoComplete="nickname"
              className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all focus-visible:ring-2"
              style={{
                background: 'var(--bg-surface)',
                border: `1.5px solid ${validationError ? 'var(--danger)' : 'var(--border)'}`,
                color: 'var(--text)',
              }}
              aria-describedby={validationError ? 'nickname-error' : undefined}
            />
            {validationError && (
              <p id="nickname-error" className="text-sm mt-1" style={{ color: 'var(--danger)' }} role="alert">
                {validationError}
              </p>
            )}
          </div>

          {/* Avatar picker */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Choose Avatar
            </p>
            <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="Avatar selection">
              {AVATARS.map((avatar, i) => (
                <button
                  key={`avatar-${i}`}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  aria-label={`Select avatar ${avatar}`}
                  aria-pressed={selectedAvatar === avatar}
                  className="text-2xl p-2 rounded-xl transition-all hover:scale-110 focus:outline-none focus-visible:ring-2"
                  style={{
                    border: `2px solid ${selectedAvatar === avatar ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedAvatar === avatar ? 'rgba(139,92,246,0.12)' : 'var(--bg-surface)',
                    animation: selectedAvatar === avatar ? 'pop 0.2s ease-out' : 'none',
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Server error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              role="alert"
              style={{
                background: 'rgba(244,63,94,0.10)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full py-3.5 rounded-full font-bold text-white transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2"
            style={{
              background: nickname.trim() ? 'var(--accent)' : 'var(--border)',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.1rem',
              boxShadow: nickname.trim() ? '0 4px 16px rgba(139,92,246,0.35)' : 'none',
              cursor: nickname.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};
