import { Controller, Post, Get, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  async chat(@Body() body: { prompt: string; conversationId?: string }) {
    try {
      const { prompt, conversationId } = body;
      
      if (!prompt || typeof prompt !== 'string') {
        throw new HttpException('Prompt is required and must be a string', HttpStatus.BAD_REQUEST);
      }

      const result = await this.chatbotService.askLlama3(prompt, conversationId);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('conversation')
  async createConversation() {
    try {
      const conversation = await this.chatbotService.createConversation();
      return {
        conversationId: conversation.id,
        createdAt: conversation.createdAt,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create conversation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('conversation/:id')
  async getConversation(@Param('id') conversationId: string) {
    try {
      const conversation = await this.chatbotService.getConversation(conversationId);
      
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: conversation.id,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get conversation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('conversation/:id')
  async deleteConversation(@Param('id') conversationId: string) {
    try {
      const deleted = await this.chatbotService.deleteConversation(conversationId);
      
      if (!deleted) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }

      return { message: 'Conversation deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete conversation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 