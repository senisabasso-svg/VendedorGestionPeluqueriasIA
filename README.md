# Benja — Asistente IA (solo frontend)

Chat con **Benja** que llama **directo a la API de Gemini** desde el navegador. No requiere backend propio.

## Configuración

```bash
cd frontend
cp .env.example .env
# Editá VITE_GEMINI_API_KEY con tu clave de Google AI Studio
npm install
npm run dev
```

Abrí http://localhost:5173/

Desde la raíz del repo también podés usar `npm run dev`.

## Variables

| Variable | Descripción |
|----------|-------------|
| `VITE_GEMINI_API_KEY` | API key principal (proyecto 1) |
| `VITE_GEMINI_API_KEY_FALLBACK` | API key de respaldo (otro proyecto Google AI); se usa si la principal agota cuota |
| `VITE_GEMINI_MODEL` | Modelo, default `gemini-2.5-flash-lite` |

## Endpoint usado

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent
```

## Deploy en Cloudflare Pages

**Opción A — raíz del repo (como tenés ahora):**

| Campo | Valor |
|--------|--------|
| Build command | `npm run build` |
| Build output directory | `frontend/dist` |

**Opción B — más simple:**

| Campo | Valor |
|--------|--------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |

**Variables de entorno (obligatorias):**

- `VITE_GEMINI_API_KEY`
- `VITE_GEMINI_API_KEY_FALLBACK` (opcional, otro proyecto)
- `VITE_GEMINI_MODEL` = `gemini-2.5-flash-lite`

## Importante — seguridad

La API key queda en el bundle del frontend (visible en DevTools). Para producción pública conviene restringir la key por dominio en Google Cloud o usar un proxy backend.

La carpeta `backend/` quedó obsoleta para este flujo; podés ignorarla.
