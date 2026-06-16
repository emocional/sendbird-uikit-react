/**
 * Contrato derivado del uso real en emo-front (`apps/dashboard/src/components/emo-chat/`).
 * Mantener alineado con emo-chat.tsx y emo-chat.utils.ts.
 */
export const EMO_FRONT_SENDBIRD_ENTRYPOINTS = [
  '@emocional/sendbird-uikit-react/SendbirdProvider',
  '@emocional/sendbird-uikit-react/GroupChannel',
  '@emocional/sendbird-uikit-react/GroupChannelList',
  '@emocional/sendbird-uikit-react/useSendbirdStateContext',
  '@emocional/sendbird-uikit-react/dist/index.css',
] as const;

/** Props que emo-front pasa a `<SendbirdProvider />`. */
export const EMO_FRONT_PROVIDER_PROP_KEYS = [
  'userId',
  'searcherFilter',
  'accessToken',
  'enableAutoChat',
  'appId',
  'userListQuery',
] as const;

/** Props que emo-front pasa a `<GroupChannelList />`. */
export const EMO_FRONT_GROUP_CHANNEL_LIST_PROP_KEYS = [
  'onChannelCreated',
  'channelListQueryParams',
  'onChannelSelect',
  'selectedChannelUrl',
  'disableAutoSelect',
] as const;

/** Props que emo-front pasa a `<GroupChannel />`. */
export const EMO_FRONT_GROUP_CHANNEL_PROP_KEYS = [
  'channelUrl',
] as const;

/** `metaData` Sendbird que emo-front lee al seleccionar canal. */
export const EMO_FRONT_MEMBER_METADATA_KEYS = [
  'company',
  'professional',
] as const;

/** Extensión que emo-front adjunta al query de usuarios (`emo-chat.utils.ts`). */
export const EMO_FRONT_USER_LIST_QUERY_EXTENSION = 'filterFn' as const;

/** Escenarios de producto que emo-front activa vía estado. */
export const EMO_FRONT_PRODUCT_SCENARIOS = {
  onboardingAutoChat: 'enableAutoChat cuando hay usersFilter (msgto / initialChats)',
  inviteSearch: 'searcherFilter enlaza búsqueda del modal con nicknameStartsWithFilter',
  distinctDmInvite: 'tap en usuario crea canal 1:1 distinct',
  channelListIncludeEmpty: 'channelListQueryParams.includeEmpty',
} as const;
