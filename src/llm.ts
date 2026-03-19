// LLM Provider Factory - Support multiple AI providers

import type { LLMConfig, LLMResponse } from './types.js';

export interface LLMProvider {
  name: string;
  generate(prompt: string, config: LLMConfig): Promise<LLMResponse>;
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  
  async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    const { OpenAI } = await import('openai');
    
    const client = new OpenAI({
      apiKey: config.apiKey
    });
    
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 4000
    });
    
    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  }
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  
  async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    
    const client = new Anthropic({
      apiKey: config.apiKey
    });
    
    const response = await client.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    return {
      content: text,
      usage: {
        promptTokens: response.usage.input_tokens || 0,
        completionTokens: response.usage.output_tokens || 0,
        totalTokens: (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0)
      }
    };
  }
}

/**
 * Google Gemini Provider
 */
export class GeminiProvider implements LLMProvider {
  name = 'gemini';
  
  async generate(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    // Dynamic import - user needs to install @google/generative-ai
    let GoogleGenerativeAI: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      try { GoogleGenerativeAI = require('@google/generative-ai'); } catch { /* ignore */ }
      if (!GoogleGenerativeAI) try { GoogleGenerativeAI = require('google-generative-ai'); } catch { /* ignore */ }
    } catch {
      throw new Error('Please install Google Generative AI package: npm install @google/generative-ai');
    }
    
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    const client = new GoogleGenerativeAI(config.apiKey);
    
    const model = client.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash'
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    return {
      content: response.text(),
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts
        completionTokens: 0,
        totalTokens: 0
      }
    };
  }
}

/**
 * Provider Factory
 */
export class LLMProviderFactory {
  private static providers: Map<string, LLMProvider> = new Map([
    ['openai', new OpenAIProvider()],
    ['anthropic', new AnthropicProvider()],
    ['gemini', new GeminiProvider()]
  ]);
  
  static get(provider: string): LLMProvider {
    const p = this.providers.get(provider.toLowerCase());
    if (!p) {
      throw new Error(`Unknown provider: ${provider}. Supported: openai, anthropic, gemini`);
    }
    return p;
  }
  
  static register(name: string, provider: LLMProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }
  
  static listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

/**
 * Create LLM client based on config
 */
export function createLLMClient(config: LLMConfig): LLMProvider {
  return LLMProviderFactory.get(config.provider);
}
