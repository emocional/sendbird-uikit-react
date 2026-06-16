import React from 'react';

import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';
import AutoCreateGroupChannels from '../features/auto-create-channels/AutoCreateGroupChannels';

/**
 * Punto de enganche único en GroupChannelListUI.
 * Añadir aquí futuras features de lista de canales (tags, etc.).
 */
export const EmocionalGroupChannelListAddons = (): React.ReactElement | null => {
  const {
    state: {
      config: { enableAutoChat },
    },
  } = useSendbird();

  if (!enableAutoChat) {
    return null;
  }

  return <AutoCreateGroupChannels />;
};

export default EmocionalGroupChannelListAddons;
