import React from "react";
import type { User } from "../../../shared/types";

interface UserListProps {
  users: User[];
  currentUserId?: string;
  sessionInfo?: { id: string; userCount: number; hostUserId?: string };
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  sessionInfo,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Players ({users.length})
        </h3>
        {sessionInfo && (
          <div className="text-xs text-gray-500">Session: {sessionInfo.id}</div>
        )}
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              user.id === currentUserId
                ? "bg-blue-50 border border-blue-200"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="text-2xl">{user.avatar || "🎮"}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className={`font-medium truncate ${
                    user.id === currentUserId
                      ? "text-blue-800"
                      : "text-gray-800"
                  }`}
                >
                  {user.nickname}
                </span>
                {user.id === currentUserId && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                    You
                  </span>
                )}
                {user.id === sessionInfo?.hostUserId && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">
                    Host
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <span>ID: {user.id.slice(0, 8)}...</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.isActive ? "bg-green-400" : "bg-gray-400"
                  }`}
                />
                <span>{user.isActive ? "Active" : "Away"}</span>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No players yet</p>
            <p className="text-sm">Share the session ID to invite others!</p>
          </div>
        )}
      </div>
    </div>
  );
};
