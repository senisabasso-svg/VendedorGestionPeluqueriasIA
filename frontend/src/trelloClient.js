import { stripDerivationMarker } from './salesConfig.js';

const SESSION_KEYS = {
  early: 'benjamin_trello_early_sent',
  sale: 'benjamin_trello_sale_sent',
};

/**
 * @param {object} params
 * @param {Array<{ role: string, content: string }>} [params.messages]
 * @param {import('./leadProfile.js').LeadProfile} [params.lead]
 * @param {'early' | 'sale'} [params.type]
 */
export async function registerTrelloLead({ messages = [], lead = null, type = 'sale' }) {
  const sessionKey = SESSION_KEYS[type] || SESSION_KEYS.sale;

  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) {
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
      body: JSON.stringify({ messages: payload, lead, type }),
    });

    if (res.ok && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(sessionKey, '1');
    }
  } catch {
    // El chat y WhatsApp siguen funcionando aunque Trello falle
  }
}
