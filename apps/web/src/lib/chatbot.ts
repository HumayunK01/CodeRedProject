// AI Chatbot service using OpenRouter API

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class ChatbotService {
  private static instance: ChatbotService;
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    // In a real app, this should come from environment variables
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || 'your-openrouter-api-key';
  }

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  async sendMessage(
    messages: ChatMessage[],
    config: ChatbotConfig = {}
  ): Promise<string> {
    // Check if API key is valid (not default/placeholder)
    const isApiKeyValid = this.apiKey && !this.apiKey.includes('your-openrouter-api-key') && this.apiKey.startsWith('sk-or-v1');

    const userMessage = messages[messages.length - 1]?.content || '';
    const lowerMessage = userMessage.toLowerCase();

    // Check if the query is malaria-related before making API calls
    const isMalariaRelated = this.isMalariaRelatedQuery(lowerMessage);

    if (!isMalariaRelated) {
      return "I'm specialized in providing information about malaria diagnosis, outbreak forecasting, and related health topics. I can help with:\n• Malaria symptoms and diagnosis\n• Prevention strategies\n• Treatment options\n• Outbreak forecasting\n• Location-based risk assessment\n\nFor questions about other topics, I recommend consulting appropriate specialists or reliable information sources.";
    }

    if (!isApiKeyValid) {
      console.warn('OpenRouter API key not configured, using hardcoded responses only');
      // Even with invalid API key, only respond to malaria queries
      if (!this.isMalariaRelatedQuery(lowerMessage)) {
        return "I'm specialized in providing information about malaria diagnosis, outbreak forecasting, and related health topics. I can help with:\n• Malaria symptoms and diagnosis\n• Prevention strategies\n• Treatment options\n• Outbreak forecasting\n• Location-based risk assessment\n\nFor questions about other topics, I recommend consulting appropriate specialists or reliable information sources.";
      }
      return this.getMockResponse(userMessage);
    }

    try {
      const { model = 'deepseek/deepseek-chat', temperature = 0.7, maxTokens = 1000 } = config;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Foresee - AI Malaria Assistant',
        },
        body: JSON.stringify({
          model: model || 'deepseek/deepseek-chat',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText} ${errorData.error?.message || ''}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      return this.cleanMarkdownResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Chatbot API error:', error);

      // Fallback to mock response if API fails (network issues, rate limits, etc.)
      // but API key is valid
      if (import.meta.env.DEV) {
        console.log('API call failed, falling back to mock response');
        const lastMessage = messages[messages.length - 1]?.content || '';
        return this.getMockResponse(lastMessage);
      }

      throw error;
    }
  }

  private cleanMarkdownResponse(content: string): string {
    return content
      // Remove markdown headers (### text)
      .replace(/^###\s+/gm, '')
      // Remove bold formatting (**text**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic formatting (*text*)
      .replace(/\*(.*?)\*/g, '$1')
      // Remove inline code (`code`)
      .replace(/`(.*?)`/g, '$1')
      // Remove code blocks (```code```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove list markers (-, *, +, 1., etc.)
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      .replace(/^[\s]*\d+\.\s+/gm, '• ')
      // Remove extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private isMalariaRelatedQuery(message: string): boolean {
    const malariaKeywords = [
      'malaria', 'symptom', 'symptoms', 'fever', 'chills', 'headache', 'fatigue',
      'location', 'region', 'forecast', 'prediction', 'predict', 'outbreak',
      'prevention', 'prevent', 'treatment', 'cure', 'medicine', 'diagnosis',
      'test', 'epidemic', 'mosquito', 'vector', 'plasmodium', 'parasite',
      'artemisinin', 'chloroquine', 'quinine', 'doxycycline', 'bed net',
      'insecticide', 'repellent', 'risk assessment', 'transmission',
      // Website usage keywords
      'website', 'how to use', 'navigate', 'guide', 'help', 'tutorial',
      'page', 'feature', 'function', 'use', 'utilize', 'operate'
    ];

    return malariaKeywords.some(keyword => message.includes(keyword));
  }

  private getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Website usage guidance
    if (lowerMessage.includes('how to use') || lowerMessage.includes('website') || lowerMessage.includes('navigate') || lowerMessage.includes('guide')) {
      return "Here's how to use the Foresee website:\n\n1. **Diagnosis Page** - Assess malaria risk by:\n   • Entering symptoms and patient information\n   • Using location detection for accurate assessment\n   • Getting AI-powered risk analysis\n\n2. **Forecast Page** - View outbreak predictions by:\n   • Selecting a region for forecasting\n   • Choosing time horizon (1-8 weeks)\n   • Viewing interactive charts and maps\n\n3. **Navigation** - Use the sidebar to:\n   • Switch between Diagnosis and Forecast pages\n   • Access reports and documentation\n   • View system status\n\n4. **AI Chat** - I'm here to help with:\n   • Malaria information and guidance\n   • Website navigation assistance\n   • Answering malaria-related questions\n\nWould you like me to explain any specific feature in more detail?";
    }

    // Only respond to malaria and health-related queries
    if (lowerMessage.includes('malaria') || lowerMessage.includes('symptom')) {
      return "I understand you're asking about malaria symptoms or diagnosis. I'm an AI assistant providing educational information only - I'm not a substitute for professional medical advice.\n\nIf you suspect malaria or have concerning symptoms, please consult with a qualified healthcare provider immediately.\n\nCommon malaria symptoms include:\n• Fever\n• Chills\n• Headache\n• Fatigue\n• Muscle aches\n\nHowever, these can also indicate other conditions, so professional medical evaluation is essential.";
    }

    if (lowerMessage.includes('location') || lowerMessage.includes('region')) {
      return "Location-based data helps with malaria risk assessment and outbreak forecasting. Different regions have varying malaria transmission patterns based on climate, mosquito populations, and healthcare infrastructure. Our system uses location data to provide more accurate risk assessments and forecasts.";
    }

    if (lowerMessage.includes('forecast') || lowerMessage.includes('prediction')) {
      return "Malaria outbreak forecasting uses historical data, climate patterns, and epidemiological models to predict potential outbreaks. Our AI analyzes trends in temperature, rainfall, population movement, and historical case data to provide early warnings for healthcare planning.";
    }

    if (lowerMessage.includes('prevention') || lowerMessage.includes('prevent')) {
      return "Malaria prevention involves several strategies:\n• Use insect repellent containing DEET\n• Sleep under insecticide-treated bed nets\n• Wear long-sleeved shirts and pants\n• Eliminate standing water where mosquitoes breed\n• Take antimalarial medications when traveling to high-risk areas\n\nConsult healthcare providers for region-specific prevention advice.";
    }

    if (lowerMessage.includes('treatment') || lowerMessage.includes('cure') || lowerMessage.includes('medicine')) {
      return "Malaria treatment depends on the type and severity:\n• Artemisinin-based combination therapies (ACTs) are most common\n• Chloroquine for sensitive strains\n• Quinine or doxycycline for resistant cases\n• Severe malaria requires hospitalization\n\nAlways consult healthcare providers for proper diagnosis and treatment - self-medication can be dangerous.";
    }

    if (lowerMessage.includes('diagnosis') || lowerMessage.includes('test')) {
      return "Malaria diagnosis typically involves:\n• Blood smear microscopy (gold standard)\n• Rapid diagnostic tests (RDTs)\n• PCR testing for confirmation\n• Clinical assessment of symptoms\n\nLaboratory testing is essential for accurate diagnosis and appropriate treatment.";
    }

    if (lowerMessage.includes('outbreak') || lowerMessage.includes('epidemic')) {
      return "Malaria outbreaks are influenced by:\n• Climate conditions (temperature, rainfall)\n• Population movement and travel\n• Healthcare access and quality\n• Vector control effectiveness\n• Drug resistance patterns\n\nOur forecasting models help predict and prevent outbreaks through early warning systems.";
    }

    // For non-malaria queries, politely redirect to malaria topics
    return "I'm specialized in providing information about malaria diagnosis, outbreak forecasting, and related health topics. I can help with:\n• Malaria symptoms and diagnosis\n• Prevention strategies\n• Treatment options\n• Outbreak forecasting\n• Location-based risk assessment\n• How to use this website\n\nFor questions about other topics, I recommend consulting appropriate specialists or reliable information sources.";
  }

  // Get conversation starters for new chats
  getConversationStarters(): string[] {
    return [
      "How do I use this website?",
      "What are the common symptoms of malaria?",
      "How does location affect malaria risk?",
      "How can I prevent malaria?",
      "What should I do if I suspect malaria?",
      "How accurate are outbreak forecasts?"
    ];
  }
}

export const chatbotService = ChatbotService.getInstance();
