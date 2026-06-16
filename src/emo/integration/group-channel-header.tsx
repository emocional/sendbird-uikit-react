import React from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import { getChannelTitle } from '../../modules/GroupChannel/components/GroupChannelHeader/utils';
import { useLocalization } from '../../lib/LocalizationContext';
import Header from '../../ui/Header';
import Label, { LabelColors, LabelTypography } from '../../ui/Label';
import { IconColors, IconTypes } from '../../ui/Icon';
import { useMediaQueryContext } from '../../lib/MediaQueryContext';
import ConnectionStatusChannelAvatar from '../features/connection-status/ConnectionStatusChannelAvatar';
import { getEmocionalChannelListTag } from '../features/metadata/user-tags';

import './group-channel-header.scss';

export interface EmocionalHeaderSlotProps {
  currentChannel: GroupChannel;
  userId: string;
  theme: string;
  onBackClick?: () => void;
}

export const EmocionalGroupChannelHeaderProfile = ({
  currentChannel,
  userId,
  theme,
  onBackClick,
}: EmocionalHeaderSlotProps): React.ReactElement => {
  const { isMobile } = useMediaQueryContext();
  const { stringSet } = useLocalization();
  const channelTitle = getChannelTitle(currentChannel, userId, stringSet);
  const roleTag = getEmocionalChannelListTag(currentChannel, userId);

  return (
    <div className="emo-group-channel-header__profile">
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
        width={40}
        height={40}
      />
      <div className="emo-group-channel-header__identity">
        <Label
          className="emo-group-channel-header__name"
          type={LabelTypography.SUBTITLE_2}
          color={LabelColors.ONBACKGROUND_1}
        >
          {channelTitle}
        </Label>
        {roleTag && (
          <Label
            className="emo-channel-preview__tag emo-group-channel-header__tag"
            type={LabelTypography.CAPTION_2}
            color={LabelColors.ONBACKGROUND_1}
          >
            {roleTag}
          </Label>
        )}
      </div>
    </div>
  );
};

/** @deprecated Use EmocionalGroupChannelHeaderProfile */
export const EmocionalGroupChannelHeaderLeft = EmocionalGroupChannelHeaderProfile;

/** @deprecated Use EmocionalGroupChannelHeaderProfile */
export const EmocionalGroupChannelHeaderMiddle = (): null => null;
