import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private conversations: Map<string, Conversation> = new Map();

  async askLlama3(prompt: string, conversationId?: string): Promise<{ response: string; conversationId: string }> {
    try {
      // Get or create conversation
      let conversation = conversationId ? this.conversations.get(conversationId) : null;
      
      if (!conversation) {
        conversation = {
          id: this.generateConversationId(),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.conversations.set(conversation.id, conversation);
      }

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      });

      // Build context from conversation history (last 10 messages)
      const recentMessages = conversation.messages.slice(-10);
      const context = recentMessages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // Prepare the prompt with context
      const fullPrompt = `Here is the conversation history:
${context}

Please provide a helpful and relevant response to the user's latest message.`;

      this.logger.log(`Sending request to Ollama for conversation ${conversation.id}`);

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama3',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
        },
      }, {
        timeout: 30000, // 30 second timeout
      });

      const botResponse = response.data.response;

      // Add bot response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date(),
      });

      conversation.updatedAt = new Date();

      this.logger.log(`Received response from Ollama for conversation ${conversation.id}`);

      return {
        response: botResponse,
        conversationId: conversation.id,
      };

    } catch (error) {
      this.logger.error('Error communicating with Ollama:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Ollama service is not running. Please start Ollama first.');
        }
        if (error.response?.status === 404) {
          throw new Error('Llama3 model not found. Please ensure the model is installed.');
        }
        if (error.code === 'ETIMEDOUT') {
          throw new Error('Request timed out. Please try again.');
        }
      }
      
      throw new Error('Failed to get response from AI model. Please try again.');
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  async createConversation(): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    return this.conversations.delete(conversationId);
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 