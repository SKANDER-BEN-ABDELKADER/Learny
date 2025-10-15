import axios from 'axios';

const chatbotService = {
  async sendMessage(message, conversationId) {
    const payload = { prompt: message };
    if (conversationId) {
      payload.conversationId = conversationId;
    }

    const response = await axios.post('http://localhost:3000/chatbot', payload);
    return response.data;
  },
};

export default chatbotService;
