import type { SendbirdProviderProps } from '../../lib/Sendbird/types';
import {
  EMOCIONAL_CONFIG_DEFAULTS,
  type EmocionalProviderProps,
  type EmocionalStateConfigFields,
} from '../types';

/** Extrae props Emocional del SendbirdProvider con defaults. */
export const resolveEmocionalProviderProps = (
  props: EmocionalProviderProps,
): EmocionalStateConfigFields => ({
  enableAutoChat: props.enableAutoChat ?? EMOCIONAL_CONFIG_DEFAULTS.enableAutoChat,
  ...(props.searcherFilter ? { searcherFilter: props.searcherFilter } : {}),
  defaultLocale: props.defaultLocale ?? EMOCIONAL_CONFIG_DEFAULTS.defaultLocale,
  skipChannelTypeSelection: props.skipChannelTypeSelection ?? EMOCIONAL_CONFIG_DEFAULTS.skipChannelTypeSelection,
});

/** Fragmento para `SendbirdState.config` (store en runtime). */
export const toEmocionalConfigState = (
  props: EmocionalStateConfigFields,
): EmocionalStateConfigFields => ({
  enableAutoChat: props.enableAutoChat ?? EMOCIONAL_CONFIG_DEFAULTS.enableAutoChat,
  searcherFilter: props.searcherFilter,
  defaultLocale: props.defaultLocale ?? EMOCIONAL_CONFIG_DEFAULTS.defaultLocale,
  skipChannelTypeSelection: props.skipChannelTypeSelection ?? EMOCIONAL_CONFIG_DEFAULTS.skipChannelTypeSelection,
});

/** Defaults para `initialState.config`. */
export { EMOCIONAL_CONFIG_DEFAULTS as emocionalConfigDefaults };

/** Defaults para el store inicial del provider (desde props del mount). */
export const emocionalConfigFromProviderProps = (
  props: Pick<SendbirdProviderProps, keyof EmocionalProviderProps>,
): EmocionalStateConfigFields => resolveEmocionalProviderProps(props);
