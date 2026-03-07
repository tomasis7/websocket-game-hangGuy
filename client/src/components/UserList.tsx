import React, { useState } from "react";
import type { User } from "../../../shared/types";

interface UserListProps {
  users: User[];
  currentUserId?: string;
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

export const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 font-semibold text-sm transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2"
        aria-expanded={!collapsed}
        style={{ color: 'var(--text)' }}
      >
        <span>Players ({users.length})</span>
        <ChevronIcon open={!collapsed} />
      </button>

      {/* Player list */}
      <div
        style={{
          maxHeight: collapsed ? '0' : '600px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <ul role="list" className="px-3 pb-3 flex flex-col gap-2">
          {users.map(user => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <li
                key={user.id}
                role="listitem"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: isCurrentUser ? 'rgba(139,92,246,0.12)' : 'transparent',
                  border: `1px solid ${isCurrentUser ? 'var(--accent)' : 'var(--border)'}`,
                  boxShadow: isCurrentUser ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
                  borderLeft: `3px solid ${user.isActive ? 'var(--success)' : 'var(--border)'}`,
                }}
              >
                <span className="text-xl flex-shrink-0" aria-hidden="true">{user.avatar || '🎮'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-semibold truncate text-sm"
                      style={{ color: isCurrentUser ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {user.nickname}
                    </span>
                    {isCurrentUser && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.6rem' }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: user.isActive ? 'var(--success)' : 'var(--text-muted)',
                        animation: user.isActive ? 'glow-pulse 2s ease-in-out infinite' : 'none',
                      }}
                      aria-label={user.isActive ? 'Active' : 'Away'}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user.isActive ? 'Active' : 'Away'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}

          {users.length === 0 && (
            <li className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
              <div className="text-3xl mb-1" aria-hidden="true">👥</div>
              <p className="text-sm">No players yet</p>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};
