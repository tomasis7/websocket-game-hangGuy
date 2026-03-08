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
      className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden h-fit"
    >
      {/* Collapsible header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 font-bold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
        aria-expanded={!collapsed}
      >
        <span className="tracking-wide">Players ({users.length})</span>
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
        <ul role="list" className="px-4 pb-4 flex flex-col gap-2">
          {users.map(user => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <li
                key={user.id}
                role="listitem"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                  isCurrentUser
                    ? 'bg-violet-50 border-violet-200 shadow-sm'
                    : 'bg-white border-zinc-100 hover:bg-zinc-50'
                }`}
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: user.isActive ? '#10b981' : '#e4e4e7',
                }}
              >
                <span className="text-2xl flex-shrink-0 bg-white p-1 rounded-xl shadow-sm border border-zinc-100" aria-hidden="true">{user.avatar || '🎮'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold truncate text-sm ${isCurrentUser ? 'text-violet-700' : 'text-zinc-700'}`}
                    >
                      {user.nickname}
                    </span>
                    {isCurrentUser && (
                      <span
                        className="text-[0.65rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-violet-500 text-white"
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${user.isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                      style={{
                        animation: user.isActive ? 'glow-pulse 2s ease-in-out infinite' : 'none',
                        boxShadow: user.isActive ? '0 0 6px #10b981' : 'none'
                      }}
                      aria-label={user.isActive ? 'Active' : 'Away'}
                    />
                    <span className="text-xs font-medium text-zinc-500">
                      {user.isActive ? 'Active' : 'Away'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}

          {users.length === 0 && (
            <li className="text-center py-8 text-zinc-400">
              <div className="text-4xl mb-2 opacity-50" aria-hidden="true">👥</div>
              <p className="text-sm font-medium">No players yet</p>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};
