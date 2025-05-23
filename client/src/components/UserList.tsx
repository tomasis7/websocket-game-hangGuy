import React from "react";
import type { User } from "../../../shared/types";

interface UserListProps {
  users: User[];
  currentUserId?: string;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Players ({users.length})
      </h3>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-2 rounded-md ${
              user.id === currentUserId
                ? "bg-blue-100 border-l-4 border-blue-500"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  user.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span
                className={`text-sm ${
                  user.id === currentUserId
                    ? "font-semibold text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {user.nickname}
                {user.id === currentUserId && " (You)"}
              </span>
            </div>

            <span className="text-xs text-gray-500">
              {new Date(user.joinedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-gray-500 text-center py-4">No players connected</p>
      )}
    </div>
  );
};
