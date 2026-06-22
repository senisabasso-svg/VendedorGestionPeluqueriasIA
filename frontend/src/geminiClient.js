import { buildSystemPrompt } from './chatSystemPrompt.js';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} messages
 */
export async function askGemini(messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Falta VITE_GEMINI_API_KEY en frontend/.env');
  }

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

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

  if (!res.ok) {
    throw new Error(data.error?.message || 'Error al consultar Gemini');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini no devolvió una respuesta');
  }

  return text;
}
