import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { buildSystemPrompt, CHAT_WELCOME_MESSAGE } from '../chatSystemPrompt.js';
import { generateChatReply } from '../geminiChat.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas consultas. Probá de nuevo en un minuto.' },
});

function normalizeMessages(body) {
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'Se requiere un array messages con al menos un mensaje' };
  }
  for (const m of messages) {
    if (!m?.content || typeof m.content !== 'string') {
      return { error: 'Cada mensaje debe tener content (string)' };
    }
    if (m.role !== 'user' && m.role !== 'assistant') {
      return { error: 'Cada mensaje debe tener role user o assistant' };
    }
  }
  if (messages[messages.length - 1].role !== 'user') {
    return { error: 'El último mensaje debe ser del usuario' };
  }
  return { messages };
}

/** GET mensaje de bienvenida (landing y panel) */
router.get('/welcome', (_req, res) => {
  res.json({ message: CHAT_WELCOME_MESSAGE });
});

/**
 * POST /api/public/chat — landing pública (sin login)
 * Body: { messages: [{ role, content }] }
 */
router.post('/public/chat', chatLimiter, async (req, res) => {
  const parsed = normalizeMessages(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const systemPrompt = buildSystemPrompt({ audiencia: 'landing' });
    const reply = await generateChatReply({
      systemPrompt,
      messages: parsed.messages,
    });
    return res.json({ reply });
  } catch (err) {
    console.error('[public/chat]', err.message);
    return res.status(500).json({
      error: 'No pude procesar la consulta. Probá de nuevo en unos segundos.',
    });
  }
});

/**
 * POST /api/chat — panel staff autenticado
 * Inyecta rol y nombreSalon desde JWT
 * Body: { messages: [{ role, content }] }
 */
router.post('/chat', chatLimiter, requireAuth, async (req, res) => {
  const parsed = normalizeMessages(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const { rol, nombreSalon, idPeluqueria } = req.user || {};
  const audiencia = rol === 'superadmin' ? 'superadmin' : 'staff';

  try {
    const systemPrompt = buildSystemPrompt({
      rol,
      nombreSalon: nombreSalon || req.user?.peluqueriaNombre,
      audiencia,
    });

    const reply = await generateChatReply({
      systemPrompt,
      messages: parsed.messages,
    });

    return res.json({
      reply,
      context: { rol, idPeluqueria, audiencia },
    });
  } catch (err) {
    console.error('[chat]', err.message);
    return res.status(500).json({
      error: 'No pude procesar la consulta. Probá de nuevo en unos segundos.',
    });
  }
});

export default router;
