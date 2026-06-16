import type { GroupChannel, GroupChannelCreateParams } from '@sendbird/chat/groupChannel';

import type { SendbirdState } from '../../../lib/Sendbird/types';
import { getCreateGroupChannel } from '../../../lib/selectors';

export const buildDistinctDirectChannelParams = (
  invitedUserId: string,
  operatorUserId: string,
): GroupChannelCreateParams => ({
  invitedUserIds: [invitedUserId],
  isDistinct: true,
  operatorUserIds: [operatorUserId],
});

export const createDistinctDirectChannel = (
  state: SendbirdState,
  invitedUserId: string,
  operatorUserId: string,
): Promise<GroupChannel> => {
  const createChannel = getCreateGroupChannel(state);
  return createChannel(buildDistinctDirectChannelParams(invitedUserId, operatorUserId));
};
