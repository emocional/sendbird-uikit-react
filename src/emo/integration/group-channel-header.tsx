import React from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import { getChannelTitle } from '../../modules/GroupChannel/components/GroupChannelHeader/utils';
import { useLocalization } from '../../lib/LocalizationContext';
import Header from '../../ui/Header';
import Label, { LabelColors, LabelTypography } from '../../ui/Label';
import Icon, { IconColors, IconTypes } from '../../ui/Icon';
import { useMediaQueryContext } from '../../lib/MediaQueryContext';
import ConnectionStatusChannelAvatar from '../features/connection-status/ConnectionStatusChannelAvatar';
import { getEmocionalUserCompanyName } from '../features/metadata/user-tags';

import './group-channel-header.scss';

export interface EmocionalHeaderSlotProps {
  currentChannel: GroupChannel;
  userId: string;
  theme: string;
  onBackClick?: () => void;
}

export const EmocionalGroupChannelHeaderLeft = ({
  currentChannel,
  userId,
  theme,
  onBackClick,
}: EmocionalHeaderSlotProps): React.ReactElement => {
  const { isMobile } = useMediaQueryContext();

  return (
    <>
      {isMobile && onBackClick && (
        <Header.Icon
          className="sendbird-chat-header__icon_back"
          onClick={onBackClick}
          type={IconTypes.ARROW_LEFT}
          color={IconColors.PRIMARY}
          width="24px"
          height="24px"
        />
      )}
      <ConnectionStatusChannelAvatar
        channel={currentChannel}
        userId={userId}
        theme={theme}
        width={32}
        height={32}
      />
    </>
  );
};

export const EmocionalGroupChannelHeaderMiddle = ({
  currentChannel,
  userId,
}: Pick<EmocionalHeaderSlotProps, 'currentChannel' | 'userId'>): React.ReactElement => {
  const { stringSet } = useLocalization();
  const channelTitle = getChannelTitle(currentChannel, userId, stringSet);
  const companyName = getEmocionalUserCompanyName(currentChannel, userId);

  return (
    <div className="emo-group-channel-header__middle">
      <Header.Title title={channelTitle} />
      {companyName && (
        <Label
          className="emo-group-channel-header__company"
          type={LabelTypography.CAPTION_2}
          color={LabelColors.ONBACKGROUND_2}
        >
          {companyName}
        </Label>
      )}
    </div>
  );
};
