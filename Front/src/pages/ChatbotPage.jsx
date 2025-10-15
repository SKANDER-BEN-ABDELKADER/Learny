import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface from '../components/Chatbot/ChatInterface';
import chatbotService from '../services/chatbotService';
import { toast } from 'sonner';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const handleSendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    // Add user message to the chat
    const userMessage = {
      content: message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await chatbotService.sendMessage(message, conversationId);
      
      // Add bot response to the chat
      const botMessage = {
        content: response.response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Set conversation ID if this is the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    toast.success('Started a new conversation');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
              <p className="text-gray-600 mt-2">
                Have a conversation with our AI assistant 
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={handleNewConversation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg h-[600px] overflow-hidden">
            <ChatInterface
              onSendMessage={handleSendMessage}
              messages={messages}
              isLoading={isLoading}
              disabled={false}
            />
          </div>

          {/* Footer */}

        </div>
      </div>
    </div>
  );
};

export default ChatbotPage; 