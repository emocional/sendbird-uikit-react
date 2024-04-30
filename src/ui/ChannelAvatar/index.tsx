import './index.scss';
import React, { useMemo } from 'react';

import type { GroupChannel } from '@sendbird/chat/groupChannel';

import Avatar from '../Avatar/index';
import Icon, { IconTypes, IconColors } from '../Icon';

import * as utils from './utils';

interface Props {
  channel: GroupChannel;
  userId: string;
  theme: string;
  width?: number;
  height?: number;
}

function ChannelAvatar({ channel, userId, theme, width = 56, height = 56 }: Props): JSX.Element {
  const isBroadcast = channel?.isBroadcast;
  const memoizedAvatar = useMemo(
    () =>
      isBroadcast ? (
        utils.generateDefaultAvatar(channel) ? (
          <div
            className="sendbird-chat-header--default-avatar"
            style={{
              width,
              height,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon type={IconTypes.BROADCAST} fillColor={IconColors.CONTENT} width={width * 0.575} height={height * 0.575} />
          </div>
        ) : (
          <Avatar
            className="sendbird-chat-header--avatar--broadcast-channel"
            src={utils.getChannelAvatarSource(channel, userId)}
            width={width}
            height={height}
            alt={channel?.name}
          />
        )
      ) : (
        <div style={{ position: 'relative' }}>
          <Avatar
            className="sendbird-chat-header--avatar--group-channel"
            src={utils.getChannelAvatarSource(channel, userId)}
            width={`${width}px`}
            height={`${height}px`}
            alt={channel?.name}
          />
          <div
            style={{
              bottom: 4,
              right: -2,
              padding: 5,
              borderRadius: 9999,
              position: 'absolute',
              backgroundColor: utils.getMemberStatus(channel, userId)[0] === 'online' ? '#4ADE80FF' : undefined,
            }}
          />
        </div>
      ),
    [utils.getChannelAvatarSource(channel, userId), theme]
  );
  return <>{memoizedAvatar}</>;
}

export default ChannelAvatar;
