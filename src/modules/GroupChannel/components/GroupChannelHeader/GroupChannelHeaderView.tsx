import './index.scss';
import React from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import { IconColors, IconTypes } from '../../../../ui/Icon';
import Header, { type HeaderCustomProps } from '../../../../ui/Header';
import { classnames } from '../../../../utils/utils';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
// @emo-integration
import {
  EmocionalGroupChannelHeaderLeft,
  EmocionalGroupChannelHeaderMiddle,
} from '../../../../emo/integration/group-channel-header';

export interface GroupChannelHeaderViewProps extends HeaderCustomProps {
  className?: string;
  currentChannel: GroupChannel;
  showSearchIcon?: boolean;
  onBackClick?: () => void;
  onSearchClick?: () => void;
  onChatHeaderActionClick?(event: React.MouseEvent<HTMLElement>): void;
}

export const GroupChannelHeaderView = ({
  className,
  currentChannel,
  showSearchIcon,
  onBackClick,
  onSearchClick,
  onChatHeaderActionClick: _onChatHeaderActionClick,
  // Header custom props
  renderLeft,
  renderMiddle,
  renderRight,
}: GroupChannelHeaderViewProps) => {
  const { state } = useSendbird();
  const { config } = state;
  const { userId, theme } = config;
  const iconColor = theme === 'dark' ? IconColors.CONTENT_INVERSE : IconColors.PRIMARY;

  const isMuted = currentChannel?.myMutedState === 'muted';

  return (
    <Header
      className={classnames('sendbird-chat-header', 'emo-group-channel-header', className)}
      renderLeft={renderLeft ?? (() => (
        <EmocionalGroupChannelHeaderLeft
          currentChannel={currentChannel}
          userId={userId}
          theme={theme}
          onBackClick={onBackClick}
        />
      ))}
      renderMiddle={renderMiddle ?? (() => (
        <EmocionalGroupChannelHeaderMiddle
          currentChannel={currentChannel}
          userId={userId}
        />
      ))}
      renderRight={renderRight ?? (() => (
        <>
          {isMuted && (
            <Header.Icon
              className="sendbird-chat-header__right__mute"
              type={IconTypes.NOTIFICATIONS_OFF_FILLED}
              color={IconColors.ON_BACKGROUND_2}
              width="24px"
              height="24px"
            />
          )}
          {(showSearchIcon && !currentChannel?.isEphemeral) && (
            <Header.IconButton
              className="sendbird-chat-header__right__search"
              onClick={onSearchClick}
              type={IconTypes.SEARCH}
              color={iconColor}
              renderIcon={(props) => <Header.Icon {...props} width="24px" height="24px" />}
            />
          )}
        </>
      ))}
    />
  );
};

export default GroupChannelHeaderView;
