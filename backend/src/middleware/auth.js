import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware opcional: valida Bearer token si existe.
 * Para integración con el backend principal de Gestión de Peluquerías.
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }
  if (!JWT_SECRET) {
    return next();
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }
  if (!JWT_SECRET) {
    return res.status(503).json({ error: 'Autenticación no configurada en el servidor' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
