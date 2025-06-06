import './index.scss';
import React from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import IconButton from '../../../../ui/IconButton';
import Icon, { IconColors, IconTypes } from '../../../../ui/Icon';
import Label, { LabelColors, LabelTypography } from '../../../../ui/Label';
import ChannelAvatar from '../../../../ui/ChannelAvatar';
import { getChannelTitle, getUserCompany } from './utils';
import { useMediaQueryContext } from '../../../../lib/MediaQueryContext';
import useSendbirdStateContext from '../../../../hooks/useSendbirdStateContext';
import { useLocalization } from '../../../../lib/LocalizationContext';

export interface GroupChannelHeaderViewProps {
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
}: GroupChannelHeaderViewProps) => {
  const { config } = useSendbirdStateContext();
  const { userId, theme } = config;
  const { isMobile } = useMediaQueryContext();

  const { stringSet } = useLocalization();

  const isMuted = currentChannel?.myMutedState === 'muted';
  const subTitle = currentChannel?.members && currentChannel?.members?.length !== 2;
  const userCompany: string | null = getUserCompany(currentChannel, userId);

  return (
    <div className={`sendbird-chat-header ${className}`} style={{ borderTopRightRadius: 16, borderTopLeftRadius: 16 }}>
      <div className="sendbird-chat-header__left">
        {isMobile && (
          <Icon
            className="sendbird-chat-header__icon_back"
            onClick={onBackClick}
            fillColor={IconColors.PRIMARY}
            width="24px"
            height="24px"
            type={IconTypes.ARROW_LEFT}
          />
        )}
        <ChannelAvatar theme={theme} channel={currentChannel} userId={userId} height={32} width={32} />
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Label className="sendbird-chat-header__left__title" type={LabelTypography.H_2} color={LabelColors.ONBACKGROUND_1}>
            {getChannelTitle(currentChannel, userId, stringSet)}
          </Label>
          {!!userCompany && (
            <div style={{ backgroundColor: '#FAFAFBFF', fontSize: 14, padding: '6px 10px 6px 10px', borderRadius: 12, fontWeight: 500 }}>
              {userCompany}
            </div>
          )}
        </div>
        <Label className="sendbird-chat-header__left__subtitle" type={LabelTypography.BODY_1} color={LabelColors.ONBACKGROUND_2}>
          {subTitle}
        </Label>
      </div>
      <div className="sendbird-chat-header__right">
        {isMuted && (
          <Icon
            className="sendbird-chat-header__right__mute"
            type={IconTypes.NOTIFICATIONS_OFF_FILLED}
            fillColor={IconColors.ON_BACKGROUND_2}
            width="24px"
            height="24px"
          />
        )}
        {showSearchIcon && !currentChannel?.isEphemeral && (
          <IconButton className="sendbird-chat-header__right__search" width="32px" height="32px" onClick={onSearchClick}>
            <Icon type={IconTypes.SEARCH} fillColor={IconColors.PRIMARY} width="24px" height="24px" />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default GroupChannelHeaderView;
