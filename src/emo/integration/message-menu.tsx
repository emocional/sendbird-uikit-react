import React, { ReactElement } from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { OpenChannel } from '@sendbird/chat/openChannel';

import Icon, { IconColors, IconTypes } from '../../ui/Icon';
import IconButton from '../../ui/IconButton';
import { MessageMenu, type MessageMenuProps } from '../../ui/MessageMenu';
import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';
import { SendableMessageType } from '../../utils';
import { ReplyType } from '../../types';
import {
  MenuConditionsParams,
  showMenuItemCopy,
  showMenuItemDelete,
  showMenuItemEdit,
  showMenuItemMarkAsUnread,
  showMenuItemOpenInChannel,
  showMenuItemReply,
  showMenuItemResend,
  showMenuItemThread,
} from '../../utils/menuConditions';
import { resolveEmocionalIsByMe } from './message-layout';

export const EMO_MESSAGE_MENU_TRIGGER_SIZE = {
  button: '24px',
  icon: '16px',
} as const;

export const EMO_REACTION_MENU_TRIGGER_SIZE = {
  button: '24px',
  icon: '16px',
} as const;

export const EMO_REACTION_PICKER_SIZE = {
  button: '28px',
  icon: '20px',
} as const;

export interface EmocionalReplyButtonProps {
  channel: GroupChannel | OpenChannel | null;
  message: SendableMessageType;
  replyType?: ReplyType;
  setQuoteMessage?: (message: SendableMessageType) => void;
}

export function EmocionalReplyButton({
  channel,
  message,
  replyType,
  setQuoteMessage,
}: EmocionalReplyButtonProps): ReactElement | null {
  if (!channel || !setQuoteMessage) {
    return null;
  }

  const params: MenuConditionsParams = {
    message,
    channel,
    isByMe: false,
    replyType,
  };

  if (!showMenuItemReply(params)) {
    return null;
  }

  return (
    <IconButton
      className="emo-message-hover-action emo-message-reply-button"
      width={EMO_MESSAGE_MENU_TRIGGER_SIZE.button}
      height={EMO_MESSAGE_MENU_TRIGGER_SIZE.button}
      onClick={(): void => {
        if (message.parentMessageId > 0) {
          return;
        }
        setQuoteMessage(message);
      }}
      disabled={message.parentMessageId > 0}
    >
      <Icon
        type={IconTypes.CHAT}
        fillColor={IconColors.CONTENT_INVERSE}
        width={EMO_MESSAGE_MENU_TRIGGER_SIZE.icon}
        height={EMO_MESSAGE_MENU_TRIGGER_SIZE.icon}
      />
    </IconButton>
  );
}

function buildMenuParams(props: MessageMenuProps, isByMe: boolean): MenuConditionsParams {
  return {
    message: props.message,
    channel: props.channel,
    isByMe,
    replyType: props.replyType,
    onReplyInThread: props.onReplyInThread,
    onMoveToParentMessage: props.onMoveToParentMessage,
  };
}

function hasEmocionalMessageMenuItems(
  params: MenuConditionsParams,
  enableMarkAsUnread: boolean,
  inThreadList?: boolean,
): boolean {
  return (
    showMenuItemCopy(params)
    || showMenuItemThread(params)
    || showMenuItemOpenInChannel(params)
    || showMenuItemEdit(params)
    || (enableMarkAsUnread && !inThreadList && showMenuItemMarkAsUnread(params))
    || showMenuItemResend(params)
    || showMenuItemDelete(params)
  );
}

export function EmocionalMessageMenu(props: MessageMenuProps): ReactElement | null {
  const isByMe = resolveEmocionalIsByMe(props.isByMe);
  const sendbirdState = useSendbird();
  const enableMarkAsUnread = sendbirdState.state.config.groupChannel.enableMarkAsUnread;
  const params = buildMenuParams(props, isByMe);

  if (!hasEmocionalMessageMenuItems(params, enableMarkAsUnread, props.inThreadList)) {
    return null;
  }

  return (
    <MessageMenu
      {...props}
      isByMe={isByMe}
      renderMenuItems={({ items: {
        CopyMenuItem,
        ThreadMenuItem,
        OpenInChannelMenuItem,
        EditMenuItem,
        MarkAsUnreadMenuItem,
        ResendMenuItem,
        DeleteMenuItem,
      } }) => (
        <>
          {showMenuItemCopy(params) && <CopyMenuItem />}
          {showMenuItemThread(params) && <ThreadMenuItem />}
          {showMenuItemOpenInChannel(params) && <OpenInChannelMenuItem />}
          {showMenuItemEdit(params) && <EditMenuItem />}
          {enableMarkAsUnread && !props.inThreadList && showMenuItemMarkAsUnread(params) && <MarkAsUnreadMenuItem />}
          {showMenuItemResend(params) && <ResendMenuItem />}
          {showMenuItemDelete(params) && <DeleteMenuItem />}
        </>
      )}
    />
  );
}
