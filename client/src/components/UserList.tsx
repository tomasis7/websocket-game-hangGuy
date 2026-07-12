import React, { useState } from "react";
import type { User } from "../../../shared/types";
import {
  getInitials,
  colorForName,
  getStoredAvatarColor,
} from "../utils/avatar";

interface UserListProps {
  users: User[];
  currentUserId?: string;
  currentTurnPlayerId?: string;
  wordSetterId?: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  currentTurnPlayerId,
  wordSetterId,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const storedColor = getStoredAvatarColor();

  return (
    <aside className="panel overflow-hidden h-fit">
      {/* Collapsible header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-accent/10"
        aria-expanded={!collapsed}
      >
        <span>Players</span>
        <span className="flex items-center gap-3 text-muted">
          {users.length}
          <ChevronIcon open={!collapsed} />
        </span>
      </button>

      {/* Player list */}
      <div
        style={{
          maxHeight: collapsed ? '0' : '600px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <ul role="list" className="px-3 pb-3 flex flex-col gap-2 border-t border-line-soft pt-3">
          {users.map(user => {
            const isCurrentUser = user.id === currentUserId;
            const isCurrentTurn = user.id === currentTurnPlayerId;
            const isWordSetter = user.id === wordSetterId;
            const color = isCurrentUser && storedColor ? storedColor : colorForName(user.nickname);
            return (
              <li
                key={user.id}
                role="listitem"
                className="flex items-center gap-3 px-3 py-2.5 border-[1.5px]"
                style={{
                  borderColor: isCurrentUser ? 'var(--accent)' : 'transparent',
                  background: isCurrentUser ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                }}
              >
                <span
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-mono text-[13px] font-bold"
                  style={{ background: color, color: '#0a0a0a' }}
                  aria-hidden="true"
                >
                  {getInitials(user.nickname)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isCurrentTurn && (
                      <span className="font-mono text-xs text-accent" aria-hidden="true">
                        ▶
                      </span>
                    )}
                    <span className="font-mono font-semibold truncate text-sm text-ink">
                      {user.nickname}
                    </span>
                    {isCurrentUser && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] bg-accent text-accent-ink">
                        You
                      </span>
                    )}
                    {isCurrentTurn && (
                      <span
                        aria-label="Current turn"
                        className="font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] border-[1.5px] border-accent text-ink"
                      >
                        Turn
                      </span>
                    )}
                    {isWordSetter && (
                      <span
                        aria-label="Word setter"
                        className="font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] border-[1.5px] border-line text-muted"
                      >
                        Word
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-1.5 h-1.5 flex-shrink-0"
                      style={{ background: user.isActive ? 'var(--good)' : 'var(--border)' }}
                      aria-label={user.isActive ? 'Active' : 'Away'}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                      {user.isActive ? 'Active' : 'Away'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}

          {users.length === 0 && (
            <li className="text-center py-8 text-muted">
              <p className="font-mono text-xs uppercase tracking-[0.08em]">No players yet</p>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};
