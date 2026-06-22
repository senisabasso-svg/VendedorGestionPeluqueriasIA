export const SALES_CONTACT = {
  name: 'Juan Diego Senisa',
  role: 'Dueño y fundador de Febrois',
  company: 'Febrois',
  product: 'Gestión de Peluquerías',
  whatsappDisplay: '092 331 019',
  whatsappRaw: '59892331019',
  email: 'senisabasso@gmail.com',
};

export const PRICING = {
  anepaMember: 990,
  standard: 1490,
  currency: 'UYU',
  anepaNote: 'Precio especial para socios de ANEPA',
};

export const DERIVATION_MARKER = '[DERIVAR_JUAN_DIEGO]';

export function getWhatsAppUrl(message) {
  const text = encodeURIComponent(
    message ||
      'Hola Juan Diego, vengo del chat con Benjamin. Quiero contratar Gestión de Peluquerías.'
  );
  return `https://wa.me/${SALES_CONTACT.whatsappRaw}?text=${text}`;
}

export function stripDerivationMarker(text) {
  return text.replace(DERIVATION_MARKER, '').trim();
}

export function shouldShowDerivation(text) {
  return text.includes(DERIVATION_MARKER);
}
