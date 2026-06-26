import type { GroupChannel } from '@sendbird/chat/groupChannel';

/**
 * Empty 1:1 channels are created for deep links (`?msgto=`) but should not clutter
 * the inbox until someone sends a message — except while the user has that channel open.
 */
export const isGroupChannelVisibleInList = (
  channel: GroupChannel,
  selectedChannelUrl?: string,
): boolean => {
  if (channel.lastMessage !== null) {
    return true;
  }

  return !!selectedChannelUrl && channel.url === selectedChannelUrl;
};

export const filterVisibleGroupChannels = (
  groupChannels: GroupChannel[],
  selectedChannelUrl?: string,
): GroupChannel[] =>
  groupChannels.filter(channel => isGroupChannelVisibleInList(channel, selectedChannelUrl));
