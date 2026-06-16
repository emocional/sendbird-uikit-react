import React from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import ChannelAvatar from '../../../ui/ChannelAvatar';
import { isPeerOnline } from './get-member-status';

import './connection-status-channel-avatar.scss';

export interface ConnectionStatusChannelAvatarProps {
  channel: GroupChannel;
  userId: string;
  theme: string;
  width?: number;
  height?: number;
}

export const ConnectionStatusChannelAvatar = ({
  channel,
  userId,
  theme,
  width = 56,
  height = 56,
}: ConnectionStatusChannelAvatarProps): React.ReactElement => {
  const showOnline = isPeerOnline(channel, userId);

  return (
    <div className="emo-connection-status-channel-avatar">
      <ChannelAvatar
        channel={channel}
        userId={userId}
        theme={theme}
        width={width}
        height={height}
      />
      {showOnline && <span className="emo-connection-status-channel-avatar__dot" aria-hidden />}
    </div>
  );
};

export default ConnectionStatusChannelAvatar;
