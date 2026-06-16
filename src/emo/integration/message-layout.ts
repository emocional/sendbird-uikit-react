/**
 * Layout de mensajes Emocional: todos los mensajes se renderizan como entrantes
 * (alineación / estilos de interlocutor), igual que el fork 3.26.0.
 */
export const EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT = true;

export const resolveEmocionalIsByMe = (isByMe: boolean): boolean => (
  EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT ? false : isByMe
);
