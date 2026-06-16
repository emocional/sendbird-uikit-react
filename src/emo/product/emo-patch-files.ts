/**
 * Archivos upstream con enganches Emocional.
 * Mantener sincronizado con `src/emo/PATCHES.md`.
 */
export const EMO_UPSTREAM_PATCH_FILES = [
  'src/lib/Sendbird/types.ts',
  'src/lib/Sendbird/context/initialState.ts',
  'src/lib/Sendbird/context/SendbirdProvider.tsx',
  'src/modules/GroupChannelList/components/GroupChannelListUI/index.tsx',
  'src/modules/CreateChannel/components/CreateChannelUI/index.tsx',
  'src/modules/GroupChannelList/components/AddGroupChannel/AddGroupChannelView.tsx',
  'src/modules/GroupChannel/components/GroupChannelHeader/GroupChannelHeaderView.tsx',
  'src/modules/GroupChannelList/components/GroupChannelListItem/index.tsx',
  'src/modules/GroupChannelList/components/GroupChannelListItem/GroupChannelListItemView.tsx',
  'src/ui/Icon/colors.ts',
  'src/ui/Icon/utils.ts',
  'src/types.ts',
] as const;

export const EMO_INTEGRATION_MARKER = '@emo-integration';
