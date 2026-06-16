/**
 * Props de SendbirdProvider añadidas por Emocional.
 * Fuente única: al mergear upstream, extender SendbirdProviderProps con este tipo.
 */
export interface EmocionalProviderProps {
  /**
   * Crea canales 1:1 distinct automáticamente para cada usuario de `userListQuery`
   * (onboarding, deep links `?msgto=`, etc.) sin abrir el modal de invitación.
   */
  enableAutoChat?: boolean;
}

/** Campos de config en el store de Sendbird que añade Emocional. */
export interface EmocionalStateConfigFields {
  enableAutoChat?: boolean;
}

export const EMOCIONAL_CONFIG_DEFAULTS: Required<EmocionalStateConfigFields> = {
  enableAutoChat: false,
};
