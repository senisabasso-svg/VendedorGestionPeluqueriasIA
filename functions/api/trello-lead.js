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

function buildCardName() {
  const when = new Date().toLocaleString('es-UY', {
    timeZone: 'America/Montevideo',
    dateStyle: 'short',
    timeStyle: 'short',
  });
  return `Lead chat Benjamin — ${when}`;
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

    const desc = [
      'Nuevo lead desde el chat comercial de Gestión de Peluquerías.',
      'Benjamin detectó intención de contratar.',
      '',
      '--- Conversación ---',
      formatMessages(messages).slice(0, MAX_DESC_LENGTH),
    ].join('\n');

    const params = new URLSearchParams({
      key: TRELLO_API_KEY,
      token: TRELLO_TOKEN,
      idList: TRELLO_LIST_ID,
      name: buildCardName(),
      desc,
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
