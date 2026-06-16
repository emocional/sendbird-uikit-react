import type { GroupChannel } from '@sendbird/chat/groupChannel';

import { getEmocionalChannelListTag } from '../features/metadata/user-tags';
import type { SendableMessageType } from '../../utils';

export const resolveEmocionalChannelListTag = (
  channel: GroupChannel,
  currentUserId: string,
): string | null => getEmocionalChannelListTag(channel, currentUserId);

/** ✓/✓✓ + hora en la lista cuando el último mensaje es propio (sin depender del flag upstream). */
export const resolveEmocionalChannelListMessageStatusEnabled = (
  channel: GroupChannel,
  currentUserId: string,
): boolean => (
  !channel.lastMessage?.isAdminMessage()
  && (channel.lastMessage as SendableMessageType)?.sender?.userId === currentUserId
);
