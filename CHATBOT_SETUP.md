# AI Chatbot Setup Guide

## Overview

OutbreakLens includes an AI-powered chatbot that uses OpenRouter to provide intelligent assistance for malaria-related questions. The chatbot is positioned as a floating widget in the bottom-right corner of all pages.

## Features

- **Real-time AI Responses**: Powered by OpenRouter's language models
- **Malaria-Specific Knowledge**: Trained responses for malaria symptoms, prevention, and forecasting
- **Conversation Memory**: Maintains context throughout the conversation
- **Fallback System**: Works with mock responses if API fails
- **Mobile Responsive**: Optimized for all screen sizes

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (it will look like `sk-or-v1-...`)

### 2. Configure Environment Variables

Create a `.env.local` file in the `apps/web/` directory:

```env
# OpenRouter API Key for AI Chatbot
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional: Custom API Base URL (for development)
# VITE_INFER_BASE_URL=http://localhost:8000
```

### 3. Restart Development Server

```bash
cd apps/web
npm run dev
```

## How It Works

### API Integration
- **Primary**: Uses OpenRouter API for real AI responses
- **Fallback**: Falls back to intelligent mock responses if API fails
- **Rate Limiting**: Respects OpenRouter's usage limits

### Conversation Flow
1. **Welcome Message**: Introduces the AI assistant
2. **Conversation Starters**: Suggests common malaria-related questions
3. **Context Awareness**: Remembers conversation history
4. **Medical Disclaimer**: Always includes appropriate disclaimers

### Mock Responses (Development)
When `VITE_OPENROUTER_API_KEY` is not set or API fails, the chatbot provides intelligent responses for:
- Malaria symptoms and diagnosis
- Location-based risk assessment
- Outbreak forecasting questions
- General health inquiries

## Usage

### For Users
- Click the chat bubble in the bottom-right corner
- Ask questions about malaria symptoms, prevention, or forecasting
- Use conversation starters for common queries
- Start new conversations anytime

### For Developers
- The chatbot integrates seamlessly with the existing UI
- Location detection enhances malaria risk assessment
- All conversations include appropriate medical disclaimers

## Customization

### Model Selection
You can customize the AI model by modifying the chatbot service:

```tsx
// In apps/web/src/lib/chatbot.ts
const model = 'deepseek/deepseek-chat'; // Change model here
```

### Conversation Starters
Modify the conversation starters in the chatbot service:

```tsx
getConversationStarters(): string[] {
  return [
    "What are the common symptoms of malaria?",
    "How does location affect malaria risk?",
    // Add your custom starters here
  ];
}
```

## Troubleshooting

### Common Issues

1. **"Badge is not defined" Error**
   - Make sure you've imported Badge from `@/components/ui/badge`
   - Check that the badge component exists in your UI components

2. **Chatbot Not Appearing**
   - Verify the Chatbot component is imported in MainLayout
   - Check browser console for JavaScript errors

3. **API Key Issues**
   - Ensure `VITE_OPENROUTER_API_KEY` is set in `.env.local`
   - Check that the API key is valid and has credits

4. **Location Detection Issues**
   - Ensure HTTPS is enabled (required for geolocation)
   - Check browser permissions for location access

### Debug Mode

The chatbot includes debug logging. Check the browser console for:
- API request/response details
- Location detection status
- Error messages and fallbacks

## Privacy & Security

- **No Data Storage**: Chat conversations are not stored
- **API Privacy**: OpenRouter handles requests securely
- **Local Processing**: Location data stays in the browser
- **Medical Disclaimer**: All responses include appropriate disclaimers

## Cost Considerations

- **OpenRouter Pricing**: Check [OpenRouter pricing](https://openrouter.ai/pricing) for API costs
- **Free Tier**: Limited free requests available
- **Development**: Mock responses work without API key for development

The AI chatbot enhances the user experience by providing instant, intelligent responses to malaria-related questions while maintaining appropriate medical disclaimers and privacy standards.
