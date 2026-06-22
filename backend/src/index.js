import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'gestion-peluquerias-chat' });
});

app.use('/api', chatRoutes);

app.use((err, _req, res, _next) => {
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Chat API escuchando en puerto ${PORT}`);
});
