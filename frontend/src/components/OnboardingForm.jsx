import { useState } from 'react';
import './OnboardingForm.css';

/**
 * @param {object} props
 * @param {(lead: import('../leadProfile.js').LeadProfile) => void} props.onComplete
 */
export default function OnboardingForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [salonName, setSalonName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [knowsSystem, setKnowsSystem] = useState(null);

  const canContinueStep1 = salonName.trim().length >= 2 && contactPhone.trim().length >= 8;

  const finish = (preference) => {
    onComplete({
      salonName: salonName.trim(),
      contactPhone: contactPhone.trim(),
      knowsSystem: Boolean(knowsSystem),
      contactPreference: preference,
    });
  };

  const handleKnowsSystem = (value) => {
    setKnowsSystem(value);
    if (value) {
      finish(null);
    } else {
      setStep(3);
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <h2 className="onboarding__title">Antes de charlar con Benjamin</h2>
        <p className="onboarding__subtitle">Completá estos datos para que te atienda mejor.</p>

        {step === 1 && (
          <div className="onboarding__step">
            <label className="onboarding__label" htmlFor="salon-name">
              Nombre de la peluquería
            </label>
            <input
              id="salon-name"
              className="onboarding__input"
              placeholder="Ej. Estilo & Color"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
            />

            <label className="onboarding__label" htmlFor="contact-phone">
              Número de contacto
            </label>
            <input
              id="contact-phone"
              className="onboarding__input"
              type="tel"
              placeholder="Ej. 099 123 456"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />

            <button
              type="button"
              className="onboarding__primary"
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding__step">
            <p className="onboarding__question">¿Ya conocés nuestro sistema Gestión de Peluquerías?</p>
            <div className="onboarding__choices">
              <button
                type="button"
                className="onboarding__choice"
                onClick={() => handleKnowsSystem(true)}
              >
                Sí, ya lo conozco
              </button>
              <button
                type="button"
                className="onboarding__choice"
                onClick={() => handleKnowsSystem(false)}
              >
                No, quiero conocerlo
              </button>
            </div>
            <button type="button" className="onboarding__back" onClick={() => setStep(1)}>
              Volver
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding__step">
            <p className="onboarding__question">¿Cómo preferís seguir?</p>
            <div className="onboarding__choices">
              <button
                type="button"
                className="onboarding__choice"
                onClick={() => finish('call')}
              >
                Que me llamen en horario de atención
              </button>
              <button
                type="button"
                className="onboarding__choice onboarding__choice--highlight"
                onClick={() => finish('chat')}
              >
                Seguir consultando acá hasta estar seguro
              </button>
            </div>
            <button type="button" className="onboarding__back" onClick={() => setStep(2)}>
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
