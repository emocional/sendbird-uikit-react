import type { GroupChannel } from '@sendbird/chat/groupChannel';

export const getPeerConnectionStatuses = (
  channel: GroupChannel | undefined,
  currentUserId: string,
): string[] => (
  (channel?.members ?? [])
    .filter((member) => member.userId !== currentUserId)
    .map((member) => member.connectionStatus)
);

export const isPeerOnline = (channel: GroupChannel | undefined, currentUserId: string): boolean => (
  getPeerConnectionStatuses(channel, currentUserId).includes('online')
);
