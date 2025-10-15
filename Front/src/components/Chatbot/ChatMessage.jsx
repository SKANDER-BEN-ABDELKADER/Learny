import React from 'react';
import { cn } from '../../lib/utils';

const ChatMessage = ({ message, isUser, timestamp }) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] px-4 py-2 rounded-lg",
        isUser 
          ? "bg-blue-500 text-white rounded-br-none" 
          : "bg-gray-100 text-gray-800 rounded-bl-none"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className={cn(
            "text-xs mt-1",
            isUser ? "text-blue-100" : "text-gray-500"
          )}>
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 