const MAX_DESC_LENGTH = 16000;

function formatMessages(messages = []) {
  return messages
    .map((m) => {
      const label = m.role === 'user' ? 'Cliente' : 'Benjamin';
      const text = String(m.content || '')
        .replace('[DERIVAR_JUAN_DIEGO]', '')
        .trim();
      return `${label}: ${text}`;
    })
    .join('\n\n');
}

function formatLeadBlock(lead) {
  if (!lead) return '';

  const lines = [
    '--- Datos del lead ---',
    `Peluquería: ${lead.salonName || '—'}`,
    `Teléfono: ${lead.contactPhone || '—'}`,
    `Ya conoce el sistema: ${lead.knowsSystem ? 'Sí' : 'No'}`,
  ];

  if (lead.contactPreference === 'call') {
    lines.push('Preferencia: Quiere que lo llamen en horario de atención');
  } else if (lead.contactPreference === 'chat') {
    lines.push('Preferencia: Seguir consultando por chat');
  }

  return lines.join('\n');
}

function buildCardName(type, lead) {
  const when = new Date().toLocaleString('es-UY', {
    timeZone: 'America/Montevideo',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  if (type === 'early' && lead?.salonName) {
    return `Contacto solicitado — ${lead.salonName}`;
  }

  if (lead?.salonName) {
    return `Lead venta — ${lead.salonName} — ${when}`;
  }

  return `Lead chat Benjamin — ${when}`;
}

function buildDescription(type, lead, messages) {
  const intro =
    type === 'early'
      ? 'Solicitud de contacto telefónico desde el chat comercial (no conoce el sistema).'
      : 'Benjamin detectó intención de contratar Gestión de Peluquerías.';

  const parts = [
    intro,
    '',
    formatLeadBlock(lead),
  ];

  if (messages.length > 0) {
    parts.push('', '--- Conversación ---', formatMessages(messages));
  }

  return parts.filter(Boolean).join('\n').slice(0, MAX_DESC_LENGTH);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_LIST_ID } = context.env;

  if (!TRELLO_API_KEY || !TRELLO_TOKEN || !TRELLO_LIST_ID) {
    return Response.json(
      { error: 'Trello no configurado en el servidor' },
      { status: 503, headers: corsHeaders() }
    );
  }

  try {
    const body = await context.request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lead = body.lead || null;
    const type = body.type === 'early' ? 'early' : 'sale';

    const params = new URLSearchParams({
      key: TRELLO_API_KEY,
      token: TRELLO_TOKEN,
      idList: TRELLO_LIST_ID,
      name: buildCardName(type, lead),
      desc: buildDescription(type, lead, messages),
    });

    const trelloRes = await fetch(`https://api.trello.com/1/cards?${params.toString()}`, {
      method: 'POST',
    });

    const trelloData = await trelloRes.json();

    if (!trelloRes.ok) {
      return Response.json(
        { error: trelloData.message || 'Error al crear tarjeta en Trello' },
        { status: trelloRes.status, headers: corsHeaders() }
      );
    }

    return Response.json(
      { ok: true, cardId: trelloData.id, url: trelloData.shortUrl },
      { headers: corsHeaders() }
    );
  } catch {
    return Response.json(
      { error: 'No se pudo registrar el lead en Trello' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
