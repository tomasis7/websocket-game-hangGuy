import React, { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import {
  AVATAR_COLORS,
  getInitials,
  setStoredAvatarColor,
} from "../utils/avatar";

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
  const [color, setColor] = useState<string>(AVATAR_COLORS[0]);
  const [validationError, setValidationError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hangGuy_nickname");
    if (saved) {
      setNickname(saved);
    }
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
      setValidationError("Enter a name to continue");
      return;
    }
    setValidationError("");
    localStorage.setItem("hangGuy_nickname", nickname.trim());
    setStoredAvatarColor(color);
    onJoin(nickname.trim(), undefined, color);
  };

  if (!isVisible) {
    return null;
  }

  const initials = getInitials(nickname);
  const isConnecting = error?.startsWith("Connecting") || error === "Joining…";

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-title"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg text-ink"
    >
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 w-full max-w-md mx-auto">
        {/* Wordmark */}
        <div className="text-center mb-9">
          <h1
            id="join-title"
            className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight"
          >
            HANGGUY<span className="text-accent">/</span>
          </h1>
          <p className="font-mono text-xs tracking-[0.18em] uppercase text-muted mt-4">
            Guess the word · together
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full panel p-7 flex flex-col"
        >
          {/* Name */}
          <label
            htmlFor="nickname-input"
            className="font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-muted mb-2.5"
          >
            Your name
          </label>
          <input
            ref={inputRef}
            id="nickname-input"
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setValidationError("");
            }}
            placeholder="e.g. Alex"
            maxLength={20}
            required
            autoComplete="nickname"
            className="w-full font-mono text-lg font-medium px-4 py-3.5 bg-bg text-ink border-[1.5px] outline-none focus:shadow-[inset_0_0_0_2px_var(--accent)] placeholder:text-muted"
            style={{
              borderColor: validationError ? "var(--accent)" : "var(--border)",
            }}
            aria-describedby={validationError ? "nickname-error" : undefined}
          />
          {validationError && (
            <p
              id="nickname-error"
              className="font-mono text-xs mt-2 text-ink"
              role="alert"
            >
              {validationError}
            </p>
          )}

          {/* Avatar colour */}
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-muted mt-7 mb-3">
            Avatar
          </span>
          <div className="flex items-center gap-4">
            <span
              className="w-13 h-13 flex-shrink-0 flex items-center justify-center font-mono font-bold text-lg border-[1.5px] border-line"
              style={{ background: color, color: "#0a0a0a", width: "3.25rem", height: "3.25rem" }}
              aria-hidden="true"
            >
              {initials}
            </span>
            <div
              className="flex gap-2.5 flex-wrap"
              role="radiogroup"
              aria-label="Avatar colour"
            >
              {AVATAR_COLORS.map((c) => {
                const selected = c === color;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Avatar colour ${c}`}
                    aria-pressed={selected}
                    className="relative w-8 h-8 border-[1.5px] border-line transition-transform hover:scale-105"
                    style={{ background: c }}
                  >
                    {selected && (
                      <span
                        className="absolute inset-[3px] border-2"
                        style={{ borderColor: "var(--ink)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status / error */}
          {error && (
            <div
              className="font-mono text-xs px-3.5 py-3 mt-6 border-[1.5px]"
              role={isConnecting ? "status" : "alert"}
              style={{
                borderColor: isConnecting ? "var(--border)" : "var(--accent)",
                color: "var(--ink)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full mt-7 font-mono font-bold text-base uppercase tracking-[0.04em] py-4 bg-accent text-accent-ink flex items-center justify-center gap-2.5 transition-[filter] hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Enter Game
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
