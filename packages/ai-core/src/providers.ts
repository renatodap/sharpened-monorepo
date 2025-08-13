// AI provider abstractions
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export class AIProviderError extends Error {
  constructor(message: string, public provider: string) {
    super(`[${provider}] ${message}`);
  }
}

export class ClaudeProvider {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-sonnet-20241022',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        messages: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      });

      return {
        content: response.content[0]?.type === 'text' ? response.content[0].text : '',
        usage: response.usage,
      };
    } catch (error: any) {
      throw new AIProviderError(error.message, 'Claude');
    }
  }

  async streamChat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    try {
      return this.client.messages.create({
        model: options?.model || 'claude-3-sonnet-20241022',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        stream: true,
        messages: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      });
    } catch (error: any) {
      throw new AIProviderError(error.message, 'Claude');
    }
  }
}

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4o-mini',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage,
      };
    } catch (error: any) {
      throw new AIProviderError(error.message, 'OpenAI');
    }
  }

  async createEmbedding(text: string, model = 'text-embedding-3-small') {
    try {
      const response = await this.client.embeddings.create({
        model,
        input: text,
      });

      return {
        embedding: response.data[0]?.embedding,
        usage: response.usage,
      };
    } catch (error: any) {
      throw new AIProviderError(error.message, 'OpenAI');
    }
  }

  async createEmbeddings(texts: string[], model = 'text-embedding-3-small') {
    try {
      const response = await this.client.embeddings.create({
        model,
        input: texts,
      });

      return {
        embeddings: response.data.map(item => item.embedding),
        usage: response.usage,
      };
    } catch (error: any) {
      throw new AIProviderError(error.message, 'OpenAI');
    }
  }
}

// Factory function for easy provider switching
export function createAIProvider(provider: 'claude' | 'openai', apiKey?: string) {
  switch (provider) {
    case 'claude':
      return new ClaudeProvider(apiKey);
    case 'openai':
      return new OpenAIProvider(apiKey);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}