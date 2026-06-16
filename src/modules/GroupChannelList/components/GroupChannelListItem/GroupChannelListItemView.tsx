import './index.scss';

import React, { useState } from 'react';

import type { GroupChannel } from '@sendbird/chat/groupChannel';

import useLongPress from '../../../../hooks/useLongPress';
import { useLocalization } from '../../../../lib/LocalizationContext';
import { useMediaQueryContext } from '../../../../lib/MediaQueryContext';
import { noop } from '../../../../utils/utils';
import { CoreMessageType } from '../../../../utils';
import { getChannelUnreadMessageCount, getLastMessageCreatedAt } from './utils';

import { GroupChannelPreviewActionProps } from '../GroupChannelPreviewAction';

import Badge from '../../../../ui/Badge';
// @emo-integration
import ConnectionStatusChannelAvatar from '../../../../emo/features/connection-status/ConnectionStatusChannelAvatar';
import Label, { LabelColors, LabelTypography } from '../../../../ui/Label';
import MentionUserLabel from '../../../../ui/MentionUserLabel';
import MessageStatus from '../../../../ui/MessageStatus';
import Modal from '../../../../ui/Modal';
import TextButton from '../../../../ui/TextButton';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';

export interface GroupChannelListItemBasicProps {
  tabIndex: number;
  channel: GroupChannel;
  onClick: () => void;
  renderChannelAction: (props: GroupChannelPreviewActionProps) => React.ReactElement;
  isSelected?: boolean;
  isTyping?: boolean;
  onLeaveChannel?: () => Promise<void>;
}

export interface GroupChannelListItemViewProps extends GroupChannelListItemBasicProps {
  channelName: string;
  channelTag?: string | null;
  isMessageStatusEnabled?: boolean;
}

export const GroupChannelListItemView = ({
  channel,
  tabIndex,
  isSelected,
  channelName,
  channelTag,
  isMessageStatusEnabled = true,
  onClick = noop,
  onLeaveChannel = () => Promise.resolve(),
  renderChannelAction,
}: GroupChannelListItemViewProps) => {
  const { state: { config } } = useSendbird();
  const { theme, userId } = config;
  const { dateLocale, stringSet } = useLocalization();
  const { isMobile } = useMediaQueryContext();
  const isMentionEnabled = config.groupChannel.enableMention;
  const unreadCount = getChannelUnreadMessageCount(channel);
  const showUnread = (!isSelected || config.groupChannel.enableMarkAsUnread)
    && !channel.isEphemeral
    && (unreadCount > 0 || (isMentionEnabled && channel.unreadMentionCount > 0));

  const [showMobileLeave, setShowMobileLeave] = useState(false);
  const onLongPress = useLongPress(
    {
      onLongPress: () => {
        if (isMobile) {
          setShowMobileLeave(true);
        }
      },
      onClick,
    },
    {
      delay: 1000,
    },
  );

  return (
    <>
      <div
        className={[
          'sendbird-channel-preview',
          'emo-channel-preview',
          isSelected ? 'sendbird-channel-preview--active' : '',
        ].join(' ')}
        role="link"
        tabIndex={tabIndex}
        {...(isMobile ? { ...onLongPress } : { onClick })}
      >
        <div className="sendbird-channel-preview__avatar emo-channel-preview__avatar">
          <ConnectionStatusChannelAvatar
            channel={channel}
            userId={userId}
            theme={theme}
            width={40}
            height={40}
          />
        </div>
        <div className="emo-channel-preview__identity">
          <Label
            className={[
              'emo-channel-preview__name',
              showUnread ? 'emo-channel-preview__name--unread' : '',
            ].join(' ')}
            testID="sendbird-channel-preview__content__upper__header__channel-name"
            type={LabelTypography.SUBTITLE_2}
            color={LabelColors.ONBACKGROUND_1}
          >
            {channelName}
          </Label>
          {channelTag && (
            <Label
              className={[
                'emo-channel-preview__tag',
                isSelected ? 'emo-channel-preview__tag--selected' : '',
              ].join(' ')}
              type={LabelTypography.CAPTION_2}
              color={LabelColors.ONBACKGROUND_1}
            >
              {channelTag}
            </Label>
          )}
        </div>
        <div className="emo-channel-preview__meta">
          {!channel.isEphemeral && isMessageStatusEnabled && (
            <MessageStatus
              className="emo-channel-preview__timestamp"
              channel={channel}
              message={channel.lastMessage as CoreMessageType}
              isDateSeparatorConsidered={false}
            />
          )}
          {!channel.isEphemeral && !isMessageStatusEnabled && (
            <Label
              className="emo-channel-preview__timestamp"
              type={LabelTypography.CAPTION_3}
              color={LabelColors.ONBACKGROUND_2}
            >
              {getLastMessageCreatedAt({
                channel,
                locale: dateLocale,
                stringSet,
              })}
            </Label>
          )}
          {showUnread && (
            <div className="emo-channel-preview__unread">
              {isMentionEnabled && channel.unreadMentionCount > 0 ? (
                <MentionUserLabel
                  className="emo-channel-preview__unread-mention"
                  color="purple"
                >
                  {'@'}
                </MentionUserLabel>
              ) : null}
              {unreadCount > 0 ? <Badge count={unreadCount} /> : null}
            </div>
          )}
        </div>
        {!isMobile && (
          <div className="sendbird-channel-preview__action">
            {renderChannelAction({ channel })}
          </div>
        )}
      </div>
      {showMobileLeave && isMobile && (
        <Modal
          className="sendbird-channel-preview__leave--mobile"
          titleText={channelName}
          hideFooter
          isCloseOnClickOutside
          onCancel={() => setShowMobileLeave(false)}
        >
          <TextButton
            onClick={() => {
              onLeaveChannel();
              setShowMobileLeave(false);
            }}
            className="sendbird-channel-preview__leave-label--mobile"
          >
            <Label
              type={LabelTypography.SUBTITLE_1}
              color={LabelColors.ONBACKGROUND_1}
            >
              {stringSet.CHANNEL_PREVIEW_MOBILE_LEAVE}
            </Label>
          </TextButton>
        </Modal>
      )}
    </>
  );
};
