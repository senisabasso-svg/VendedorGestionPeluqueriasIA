import { stripDerivationMarker } from './salesConfig.js';

const SESSION_KEY = 'benjamin_trello_lead_sent';

/**
 * Registra un lead calificado en Trello vía Cloudflare Pages Function.
 * Falla en silencio para no interrumpir la experiencia del chat.
 *
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} messages
 */
export async function registerTrelloLead(messages) {
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) {
    return;
  }

  const payload = messages.map((m) => ({
    role: m.role,
    content: m.role === 'assistant' ? stripDerivationMarker(m.content) : m.content,
  }));

  try {
    const res = await fetch('/api/trello-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: payload }),
    });

    if (res.ok && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  } catch {
    // El chat y WhatsApp siguen funcionando aunque Trello falle
  }
}
