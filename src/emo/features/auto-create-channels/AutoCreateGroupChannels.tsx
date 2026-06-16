import { useEffect } from 'react';

import useSendbird from '../../../lib/Sendbird/context/hooks/useSendbird';
import { useGroupChannelList } from '../../../modules/GroupChannelList/context/useGroupChannelList';
import { applyEmocionalUserListFilter } from '../../types/user-list-query';
import { createDistinctDirectChannel } from './create-distinct-direct-channel';

/**
 * @see src/emo/README.md — feature: auto-create-channels
 */
export const AutoCreateGroupChannels = (): null => {
  const { state } = useSendbird();
  const { config, stores } = state;
  const { enableAutoChat, userListQuery, userId, logger } = config;
  const sdk = stores.sdkStore.sdk;
  const {
    state: { onChannelCreated },
  } = useGroupChannelList();

  useEffect(() => {
    if (!enableAutoChat || !userListQuery || !sdk?.groupChannel || !userId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      const query = userListQuery();
      if (!query || query.isLoading || !query.hasNext) {
        return;
      }

      const users = applyEmocionalUserListFilter(query, await query.next());
      if (cancelled || users.length === 0) {
        return;
      }

      for (const user of users) {
        if (cancelled || user.userId === userId) {
          continue;
        }

        try {
          const channel = await createDistinctDirectChannel(state, user.userId, userId);
          if (!cancelled) {
            onChannelCreated?.(channel);
          }
        } catch (error) {
          logger?.error?.('AutoCreateGroupChannels: failed to create channel', error);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [enableAutoChat, userListQuery, userId, sdk, state, onChannelCreated, logger]);

  return null;
};

export default AutoCreateGroupChannels;
