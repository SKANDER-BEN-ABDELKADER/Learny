import api from './api';

const chatbotService = {
  async sendMessage(message, conversationId) {
    const payload = { prompt: message };
    if (conversationId) {
      payload.conversationId = conversationId;
    }

    const response = await api.post('/chatbot', payload);
    return response.data;
  },
};

export default chatbotService;
