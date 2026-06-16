import { useEffect } from 'react';
import type { User } from '@sendbird/chat';
import type { GroupChannelCreateParams } from '@sendbird/chat/groupChannel';

import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
import { getCreateGroupChannel } from '../../../../lib/selectors';
import { UserListQuery } from '../../../../types';
import { useGroupChannelList } from '../../context/useGroupChannelList';

type UserListQueryWithFilter = UserListQuery & {
  filterFn?: (user: User) => boolean;
};

const applyClientFilter = (query: UserListQuery, users: User[]): User[] => {
  const filterFn = (query as UserListQueryWithFilter).filterFn;
  if (typeof filterFn === 'function') {
    return users.filter(filterFn);
  }
  return users;
};

/**
 * When `enableAutoChat` is true on SendbirdProvider, creates a distinct 1:1 group
 * channel for each user returned by `userListQuery` (e.g. onboarding / ?msgto=).
 */
export const AutoCreateGroupChannels = (): null => {
  const { state } = useSendbird();
  const { config, stores } = state;
  const { enableAutoChat, userListQuery, userId, logger } = config;
  const sdk = stores.sdkStore.sdk;
  const { state: { onChannelCreated } } = useGroupChannelList();

  useEffect(() => {
    if (!enableAutoChat || !userListQuery || !sdk?.groupChannel || !userId) {
      return;
    }

    let cancelled = false;

    const createChannels = async () => {
      const query = userListQuery();
      if (!query || query.isLoading || !query.hasNext) {
        return;
      }

      const users = applyClientFilter(query, await query.next());
      if (cancelled || users.length === 0) {
        return;
      }

      const createChannel = getCreateGroupChannel(state);

      for (const user of users) {
        if (cancelled || user.userId === userId) {
          continue;
        }

        const params: GroupChannelCreateParams = {
          invitedUserIds: [user.userId],
          isDistinct: true,
          operatorUserIds: [userId],
        };

        try {
          const channel = await createChannel(params);
          if (!cancelled) {
            onChannelCreated?.(channel);
          }
        } catch (error) {
          logger?.error?.('AutoCreateGroupChannels: failed to create channel', error);
        }
      }
    };

    createChannels();

    return () => {
      cancelled = true;
    };
  }, [enableAutoChat, userListQuery, userId, sdk, state, onChannelCreated, logger]);

  return null;
};

export default AutoCreateGroupChannels;
