import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t bg-white">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading || disabled}
          className={cn(
            "w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[44px] max-h-32"
          )}
          rows={1}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading || disabled}
        className={cn(
          "p-3 bg-blue-500 text-white rounded-lg",
          "hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          "flex items-center justify-center"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default ChatInput; 