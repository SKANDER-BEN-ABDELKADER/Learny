import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Bot, User } from 'lucide-react';

const ChatInterface = ({ onSendMessage, messages, isLoading, disabled }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">AI Assistant</h2>
          <p className="text-sm text-gray-500">Ask me anything!</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Bot className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Welcome to the Chat!</h3>
            <p className="text-sm">Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        disabled={disabled}
      />
    </div>
  );
};

export default ChatInterface; 