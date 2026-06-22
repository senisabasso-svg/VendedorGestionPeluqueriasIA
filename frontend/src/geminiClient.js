import { buildSystemPrompt } from './chatSystemPrompt.js';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getApiKeys() {
  const keys = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK,
  ].filter(Boolean);

  return [...new Set(keys)];
}

function isQuotaError(status, message = '') {
  const lower = message.toLowerCase();
  return (
    status === 429 ||
    lower.includes('quota exceeded') ||
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit')
  );
}

/**
 * @param {string} apiKey
 * @param {Array<{ role: 'user' | 'assistant', parts: { text: string }[] }>} contents
 */
async function callGemini(apiKey, contents) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt() }],
      },
      contents,
    }),
  });

  const data = await res.json();
  const errorMessage = data.error?.message || '';

  if (!res.ok) {
    const err = new Error(errorMessage || 'Error al consultar Gemini');
    err.status = res.status;
    err.isQuotaError = isQuotaError(res.status, errorMessage);
    throw err;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini no devolvió una respuesta');
  }

  return text;
}

/**
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} messages
 */
export async function askGemini(messages) {
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    throw new Error('Falta VITE_GEMINI_API_KEY (configurala en .env o Cloudflare)');
  }

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let lastError = null;

  for (let i = 0; i < apiKeys.length; i += 1) {
    try {
      return await callGemini(apiKeys[i], contents);
    } catch (err) {
      lastError = err;
      const hasFallback = i < apiKeys.length - 1;
      if (err.isQuotaError && hasFallback) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No se pudo consultar Gemini');
}
