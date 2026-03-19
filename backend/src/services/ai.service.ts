import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const groq = new Groq({ apiKey: env.ai.groqKey });
const gemini = new GoogleGenerativeAI(env.ai.geminiKey);

const SYSTEM_PROMPT = `You are Axon AI, an expert API debugging assistant. 
When given a failing API request and relevant code, you:
1. Identify the exact cause of the failure
2. Point to the specific file and line number if provided
3. Give a clear, concise explanation of what went wrong
4. Provide an exact code fix
5. Keep responses focused and developer-friendly
Always respond in this exact JSON format:
{
  "diagnosis": "Clear explanation of what went wrong",
  "location": "filename:line_number or null",
  "fix": "Exact code fix or steps to resolve",
  "severity": "low|medium|high"
}`;

interface DebugRequest {
  method: string;
  url: string;
  statusCode: number;
  errorMessage?: string;
  requestBody?: any;
  responseBody?: any;
  codeContext?: string;
  filePath?: string;
  lineNumber?: number;
}

interface AIResponse {
  diagnosis: string;
  location: string | null;
  fix: string;
  severity: 'low' | 'medium' | 'high';
  provider: string;
}

async function tryGroq(prompt: string): Promise<AIResponse> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const text = completion.choices[0]?.message?.content || '';
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return { ...parsed, provider: 'groq' };
}

async function tryGemini(prompt: string): Promise<AIResponse> {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(
    `${SYSTEM_PROMPT}\n\nUser: ${prompt}`
  );
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return { ...parsed, provider: 'gemini' };
}

async function tryMistral(prompt: string): Promise<AIResponse> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.ai.mistralKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const text = data.choices[0]?.message?.content || '';
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return { ...parsed, provider: 'mistral' };
}

export async function debugAPI(request: DebugRequest): Promise<AIResponse> {
  const prompt = `
API Request Failed:
- Method: ${request.method}
- URL: ${request.url}
- Status Code: ${request.statusCode}
- Error: ${request.errorMessage || 'Unknown error'}
- Request Body: ${JSON.stringify(request.requestBody) || 'None'}
- Response: ${JSON.stringify(request.responseBody) || 'None'}
${request.codeContext ? `
Code Context:
File: ${request.filePath || 'Unknown'}
Line: ${request.lineNumber || 'Unknown'}
\`\`\`
${request.codeContext}
\`\`\`
` : ''}
Diagnose this failure and provide a fix.
  `.trim();

  // Try each provider in order
  const providers = [tryGroq, tryGemini, tryMistral];

  for (const provider of providers) {
    try {
      const result = await provider(prompt);
      return result;
    } catch (err) {
      console.log(`Provider failed, trying next...`);
      continue;
    }
  }

  // All providers failed
  return {
    diagnosis: 'Unable to diagnose at this time. Please try again.',
    location: null,
    fix: 'Check your API endpoint and request parameters manually.',
    severity: 'medium',
    provider: 'none',
  };
}

export async function explainRoute(
  method: string,
  path: string,
  codeContext: string
): Promise<string> {
  const prompt = `Explain what this API route does in 2-3 simple sentences:
Method: ${method}
Path: ${path}
Code:
\`\`\`
${codeContext}
\`\`\`
Respond with just the explanation, no JSON.`;

  const providers = [tryGroq, tryGemini, tryMistral];

  for (const provider of providers) {
    try {
      const result = await provider(prompt);
      return result.diagnosis || 'Unable to explain route.';
    } catch {
      continue;
    }
  }

  return 'Unable to explain route at this time.';
}