/**
 * Props de SendbirdProvider añadidas por Emocional.
 * Fuente única: al mergear upstream, extender SendbirdProviderProps con este tipo.
 */
import type { EmocionalLocale } from '../locales/get-emocional-string-set';

export interface EmocionalProviderProps {
  /**
   * Crea canales 1:1 distinct automáticamente para cada usuario de `userListQuery`
   * (onboarding, deep links `?msgto=`, etc.) sin abrir el modal de invitación.
   */
  enableAutoChat?: boolean;
  /** Callback de búsqueda en el modal de invitación (emo-front filtra la query). */
  searcherFilter?: (value: string) => void;
  /** Locale por defecto del fork Emocional. Sobrescribible con `stringSet` / `dateLocale`. */
  defaultLocale?: EmocionalLocale;
  /**
   * Si true (default), omite el selector de tipo de canal y usa el flujo directo 1:1.
   * Upstream 3.18 añadió SelectChannelType; Emocional solo usa DMs distinct.
   */
  skipChannelTypeSelection?: boolean;
}

/** Campos de config en el store de Sendbird que añade Emocional. */
export interface EmocionalStateConfigFields {
  enableAutoChat?: boolean;
  searcherFilter?: (value: string) => void;
  defaultLocale: EmocionalLocale;
  skipChannelTypeSelection: boolean;
}

export const EMOCIONAL_CONFIG_DEFAULTS = {
  enableAutoChat: false,
  defaultLocale: 'es' as EmocionalLocale,
  skipChannelTypeSelection: true,
};
