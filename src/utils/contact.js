const SUPPORT_PHONE = '+923263133136';

export const WHATSAPP_PHONE = SUPPORT_PHONE.replace(/\D/g, '');

export const getWhatsAppUrl = (message = '') => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_PHONE}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

export const formatSupportPhone = () => SUPPORT_PHONE;
