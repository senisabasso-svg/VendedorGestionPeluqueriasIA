import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_WELCOME_MESSAGE } from '../chatSystemPrompt.js';
import { askGemini } from '../geminiClient.js';
import {
  getWhatsAppUrl,
  isQuotaBusyMessage,
  SALES_CONTACT,
  shouldShowDerivation,
  stripDerivationMarker,
} from '../salesConfig.js';
import './ChatAssistant.css';

const BENJAMIN_NAME = 'Benjamin';
const BENJAMIN_TAGLINE = 'Tu asesor de Gestión de Peluquerías';
const BENJAMIN_AVATAR = '/benja.png';

function MessageBubble({ message, isAssistant }) {
  const showCta = isAssistant && shouldShowDerivation(message.content);
  const showQuotaCta = isAssistant && isQuotaBusyMessage(message.content);
  const text = isAssistant ? stripDerivationMarker(message.content) : message.content;

  return (
    <>
      <div
        className={`chat-assistant__bubble chat-assistant__bubble--${isAssistant ? 'assistant' : 'user'}`}
      >
        {text}
      </div>
      {showQuotaCta && (
        <a
          className="chat-assistant__whatsapp"
          href={getWhatsAppUrl('Hola Juan Diego, escribo desde el chat con Benjamin. Tengo una consulta urgente.')}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp · {SALES_CONTACT.whatsappDisplay}
        </a>
      )}
      {showCta && (
        <div className="chat-assistant__cta">
          <p className="chat-assistant__cta-title">
            Te paso con {SALES_CONTACT.name}, {SALES_CONTACT.role}
          </p>
          <a
            className="chat-assistant__whatsapp"
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir por WhatsApp · {SALES_CONTACT.whatsappDisplay}
          </a>
          <a className="chat-assistant__email" href={`mailto:${SALES_CONTACT.email}`}>
            {SALES_CONTACT.email}
          </a>
        </div>
      )}
    </>
  );
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: CHAT_WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  const hasDerivation = messages.some(
    (m) => m.role === 'assistant' && shouldShowDerivation(m.content)
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const reply = await askGemini(nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (err.isQuotaError) {
        setMessages((prev) => [...prev, { role: 'assistant', content: err.message }]);
      } else {
        setError(err.message || 'No se pudo conectar con Benjamin');
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-assistant">
      <div className="chat-assistant__layout">
        <header className="chat-assistant__profile">
          <img
            className="chat-assistant__avatar"
            src={BENJAMIN_AVATAR}
            alt={`${BENJAMIN_NAME}, ${BENJAMIN_TAGLINE}`}
          />
          <div className="chat-assistant__identity">
            <h1 className="chat-assistant__name">{BENJAMIN_NAME}</h1>
            <p className="chat-assistant__tagline">{BENJAMIN_TAGLINE}</p>
            <span className="chat-assistant__badge">
              Asesor comercial IA · Febrois · Gestión de Peluquerías
            </span>
          </div>
        </header>

        <div className="chat-assistant__panel" role="region" aria-label="Chat con Benjamin">
          <div className="chat-assistant__messages" ref={listRef}>
            {messages.map((m, i) =>
              m.role === 'assistant' ? (
                <div key={i} className="chat-assistant__row chat-assistant__row--assistant">
                  <img
                    className="chat-assistant__bubble-avatar"
                    src={BENJAMIN_AVATAR}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="chat-assistant__assistant-content">
                    <span className="chat-assistant__sender">{BENJAMIN_NAME}</span>
                    <MessageBubble message={m} isAssistant />
                  </div>
                </div>
              ) : (
                <div key={i} className="chat-assistant__row chat-assistant__row--user">
                  <MessageBubble message={m} isAssistant={false} />
                </div>
              )
            )}
            {loading && (
              <div className="chat-assistant__row chat-assistant__row--assistant">
                <img
                  className="chat-assistant__bubble-avatar"
                  src={BENJAMIN_AVATAR}
                  alt=""
                  aria-hidden="true"
                />
                <div className="chat-assistant__assistant-content">
                  <span className="chat-assistant__sender">{BENJAMIN_NAME}</span>
                  <div className="chat-assistant__bubble chat-assistant__bubble--assistant chat-assistant__typing">
                    Escribiendo…
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="chat-assistant__error">{error}</p>}

          {hasDerivation && (
            <div className="chat-assistant__cta-bar">
              <span>¿Listo para el alta?</span>
              <a
                className="chat-assistant__whatsapp chat-assistant__whatsapp--compact"
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp con {SALES_CONTACT.name}
              </a>
            </div>
          )}

          <footer className="chat-assistant__footer">
            <textarea
              className="chat-assistant__input"
              rows={3}
              placeholder="Contale a Benjamin sobre tu salón…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              className="chat-assistant__send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Enviar
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export { ChatAssistant };
