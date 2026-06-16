import type { GroupChannel } from '@sendbird/chat/groupChannel';

import { getEmocionalChannelListTag } from '../features/metadata/user-tags';

export const resolveEmocionalChannelListTag = (
  channel: GroupChannel,
  currentUserId: string,
): string | null => getEmocionalChannelListTag(channel, currentUserId);
