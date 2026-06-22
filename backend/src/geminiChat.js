import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

let client = null;

function getModel() {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no configurada en el servidor');
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client.getGenerativeModel({ model: modelName });
}

/**
 * @param {{ systemPrompt: string, messages: Array<{ role: 'user' | 'assistant', content: string }> }} params
 */
export async function generateChatReply({ systemPrompt, messages }) {
  const model = getModel();

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('El último mensaje debe ser del usuario');
  }

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}
