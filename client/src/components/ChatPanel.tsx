import React, { useState } from "react";
import type { User, ChatMessage } from "../../../shared/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser: User | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUser,
}) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim() && currentUser) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-64 flex flex-col">
      <h3 className="font-semibold text-gray-800 mb-2">Game Chat</h3>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 border rounded p-2 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm italic text-center py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span
                className={`font-medium ${
                  msg.type === "system"
                    ? "text-green-600"
                    : msg.type === "game"
                    ? "text-purple-600"
                    : "text-blue-600"
                }`}
              >
                {msg.playerName}:
              </span>
              <span className="ml-2 text-gray-700">{msg.message}</span>
              <span className="ml-2 text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={currentUser ? "Type a message..." : "Join game to chat"}
          className="flex-1 px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
          disabled={!currentUser}
        />
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || !currentUser}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>

      {!currentUser && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          Join the game to participate in chat
        </div>
      )}
    </div>
  );
};
