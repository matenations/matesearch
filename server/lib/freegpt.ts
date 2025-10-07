// Music AI assistant - Uses Hugging Face Inference API (free tier)
// Hugging Face provides free access to various AI models

import fetch from 'node-fetch';

// Hugging Face Inference API endpoints
const AI_ENDPOINTS = [
  {
    name: 'Hugging Face Mistral',
    url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    buildBody: (query: string) => ({
      inputs: query,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    extractResponse: (data: any) => {
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      return data.generated_text || data[0] || data.text || JSON.stringify(data);
    },
    timeout: 30000,
  },
  {
    name: 'Hugging Face Qwen',
    url: 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct',
    buildBody: (query: string) => ({
      inputs: query,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    extractResponse: (data: any) => {
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      return data.generated_text || data[0] || data.text || JSON.stringify(data);
    },
    timeout: 30000,
  },
  {
    name: 'Hugging Face Llama',
    url: 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
    buildBody: (query: string) => ({
      inputs: query,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    extractResponse: (data: any) => {
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }
      return data.generated_text || data[0] || data.text || JSON.stringify(data);
    },
    timeout: 30000,
  }
];

async function tryEndpoint(endpoint: typeof AI_ENDPOINTS[0], query: string): Promise<string | null> {
  try {
    console.log(`[AI] Trying ${endpoint.name}...`);
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpoint.buildBody(query)),
      signal: AbortSignal.timeout(endpoint.timeout),
    });
    
    if (!response.ok) {
      console.log(`[AI] ${endpoint.name} returned status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const aiResponse = endpoint.extractResponse(data);
    
    if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim()) {
      console.log(`[AI] ${endpoint.name} succeeded`);
      return aiResponse;
    }
    
    return null;
  } catch (error: any) {
    console.log(`[AI] ${endpoint.name} failed:`, error.message);
    return null;
  }
}

export async function freegptChat({ messages, model = 'gpt-3.5-turbo', max_tokens = 400, temperature = 0.7 }) {
  const userMessage = messages[messages.length - 1]?.content || '';
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  
  const query = systemMessage ? `${systemMessage}\n\nUser: ${userMessage}` : userMessage;
  
  // Try each endpoint in order
  for (const endpoint of AI_ENDPOINTS) {
    const result = await tryEndpoint(endpoint, query);
    if (result) {
      return result;
    }
  }
  
  // If all endpoints fail, return a helpful message
  console.error('[AI] All AI endpoints failed');
  return "I'm currently unable to connect to the AI service. The API may be waking up (this can take 30-60 seconds for free services). Please try again in a moment, or ask a specific music question.";
}
