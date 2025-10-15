# Chatbot Integration Setup Guide

This guide will help you set up and run the chatbot integration between your frontend and backend.

## Prerequisites

1. **Ollama Installation**: Make sure you have Ollama installed and running
2. **Llama3 Model**: Ensure the Llama3 model is downloaded in Ollama

## Setup Steps

### 1. Install Ollama (if not already installed)

Visit [https://ollama.ai](https://ollama.ai) and follow the installation instructions for your operating system.

### 2. Download Llama3 Model

```bash
ollama pull llama3
```

### 3. Start Ollama Service

```bash
ollama serve
```

### 4. Start the Backend

```bash
cd back
npm install
npm run start:dev
```

The backend will start on `http://localhost:3000`

### 5. Start the Frontend

```bash
cd Front
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 6. Test the Chatbot

1. Navigate to `http://localhost:5173/chatbot`
2. Start a conversation with the AI assistant
3. The chatbot will use the Llama3 model through Ollama

## Features

- **Real-time Chat Interface**: Modern UI with message bubbles
- **Conversation History**: Maintains context across messages
- **Error Handling**: Graceful error handling and user feedback
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Visual feedback during AI processing

## API Endpoints

- `POST /chatbot` - Send a message to the AI
- `POST /chatbot/conversation` - Create a new conversation
- `GET /chatbot/conversation/:id` - Get conversation history
- `DELETE /chatbot/conversation/:id` - Delete a conversation

## Troubleshooting

### Common Issues

1. **"Ollama service is not running"**
   - Make sure Ollama is installed and running
   - Run `ollama serve` in a terminal

2. **"Llama3 model not found"**
   - Download the model: `ollama pull llama3`

3. **CORS Issues**
   - The backend is configured to allow requests from the frontend
   - Make sure both services are running on the correct ports

4. **Slow Responses**
   - The first response might be slow as the model loads
   - Subsequent responses should be faster

### Performance Tips

- The chatbot uses conversation context (last 10 messages) for better responses
- Consider using a smaller model for faster responses
- The backend includes a 30-second timeout for requests

## File Structure

```
Front/src/
├── components/Chatbot/
│   ├── ChatInterface.jsx    # Main chat interface
│   ├── ChatMessage.jsx      # Individual message component
│   └── ChatInput.jsx        # Message input component
├── pages/
│   └── ChatbotPage.jsx      # Chatbot page
└── services/
    └── chatbotService.js    # API communication service

back/src/
├── chatbot/
│   ├── chatbot.controller.ts # API endpoints
│   ├── chatbot.service.ts    # Business logic
│   └── chatbot.module.ts     # Module configuration
```

## Next Steps

- Add user authentication to conversations
- Implement conversation persistence in database
- Add file upload capabilities
- Integrate with course content for contextual responses 