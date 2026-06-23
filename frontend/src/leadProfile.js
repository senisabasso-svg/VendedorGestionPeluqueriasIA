/**
 * @typedef {'call' | 'chat'} ContactPreference
 */

/**
 * @typedef {object} LeadProfile
 * @property {string} salonName
 * @property {string} contactPhone
 * @property {boolean} knowsSystem
 * @property {ContactPreference | null} contactPreference
 */

export function createWelcomeMessage(lead) {
  if (lead.knowsSystem) {
    return `¡Hola! Gracias por tus datos, ${lead.salonName}. Ya conocés Gestión de Peluquerías — contame en qué te puedo ayudar hoy o si querés avanzar con el alta.`;
  }

  return `¡Hola! Soy Benjamin, tu asesor de Gestión de Peluquerías. Te voy a contar cómo el sistema puede ordenar ${lead.salonName} — cobros, turnos, stock, clientes e informes. ¿Qué es lo que más te cuesta hoy en el salón?`;
}

export function createEarlyContactMessage(lead) {
  return `¡Perfecto, ${lead.salonName}! Registré tu pedido para que te contactemos al ${lead.contactPhone} en horario de atención. Juan Diego te va a llamar o podés escribirle directo por WhatsApp si preferís no esperar.`;
}

export function getWhatsAppMessageForLead(lead, type = 'sale') {
  if (type === 'early') {
    return `Hola Juan Diego, soy de ${lead.salonName} (${lead.contactPhone}). Vengo del chat con Benjamin y prefiero que me contacten para conocer Gestión de Peluquerías.`;
  }
  return `Hola Juan Diego, soy de ${lead.salonName} (${lead.contactPhone}). Vengo del chat con Benjamin y quiero contratar Gestión de Peluquerías.`;
}
