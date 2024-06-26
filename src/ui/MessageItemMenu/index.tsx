import './index.scss';
import React, { MouseEvent, ReactElement, useContext, useRef } from 'react';
import type { UserMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { OpenChannel } from '@sendbird/chat/openChannel';

import ContextMenu, { MenuItems, MenuItem } from '../ContextMenu';
import Icon, { IconTypes, IconColors } from '../Icon';
import IconButton from '../IconButton';
import {
  getClassName,
  copyToClipboard,
  isUserMessage,
  isSentMessage,
  isFailedMessage,
  isPendingMessage,
  SendableMessageType,
} from '../../utils/index';
import { LocalizationContext } from '../../lib/LocalizationContext';
import { Role } from '../../lib/types';
import { ReplyType } from '../../types';
import { deleteNullish } from '../../utils/utils';
import useSendbirdStateContext from '../../hooks/useSendbirdStateContext';

export interface MessageMenuRenderMenuItemProps {
  className?: string;
  onClick?: (e: MouseEvent) => void;
  dataSbId?: string;
  disable?: boolean;
  text: string;
}
export interface MessageMenuProps {
  className?: string | Array<string>;
  message: SendableMessageType;
  channel: GroupChannel | OpenChannel;
  isByMe?: boolean;
  disabled?: boolean;
  replyType?: ReplyType;
  disableDeleteMessage?: boolean;
  showEdit?: (bool: boolean) => void;
  showRemove?: (bool: boolean) => void;
  deleteMessage?: (message: SendableMessageType) => void;
  resendMessage?: (message: SendableMessageType) => void;
  setQuoteMessage?: (message: SendableMessageType) => void;
  setSupposedHover?: (bool: boolean) => void;
  onReplyInThread?: (props: { message: SendableMessageType }) => void;
  onMoveToParentMessage?: () => void;
  renderMenuItem?: (props: MessageMenuRenderMenuItemProps) => ReactElement;
}

export interface IReplyMessage {
  message: SendableMessageType;
  channel: GroupChannel | OpenChannel;
  replyType?: ReplyType;
  setQuoteMessage?: (message: SendableMessageType) => void;
}

export function ReplyButton(props: IReplyMessage): ReactElement {
  const { message, channel, replyType, setQuoteMessage } = props;

  const isReplyTypeEnabled =
    !isFailedMessage(message) &&
    !isPendingMessage(message) &&
    channel?.isGroupChannel?.() &&
    !channel?.isEphemeral &&
    (((channel as GroupChannel)?.isBroadcast && channel?.myRole === Role.OPERATOR) || !(channel as GroupChannel)?.isBroadcast);
  const showMenuItemReply = isReplyTypeEnabled && replyType === 'QUOTE_REPLY';

  if (!showMenuItemReply) return null;

  return (
    <IconButton className="sendbird-message-item-menu__trigger" width="24px" height="24px" onClick={(): void => setQuoteMessage(message)}>
      <Icon
        className="sendbird-message-item-menu__trigger__icon"
        type={IconTypes.CHAT}
        fillColor={IconColors.CONTENT_INVERSE}
        width="16px"
        height="16px"
      />
    </IconButton>
  );
}

export function MessageMenu(props: MessageMenuProps): ReactElement {
  const {
    className,
    message,
    channel,
    disabled = false,
    replyType,
    disableDeleteMessage = null,
    showEdit,
    showRemove,
    deleteMessage,
    resendMessage,
    setSupposedHover,
    onReplyInThread,
    onMoveToParentMessage = null,
  } = props;

  const { renderMenuItem = (props: MessageMenuRenderMenuItemProps) => <MenuItem {...props}>{props.text}</MenuItem> } = deleteNullish(props);

  const { stringSet } = useContext(LocalizationContext);
  const triggerRef = useRef(null);
  const containerRef = useRef(null);

  const globalStore = useSendbirdStateContext();

  const { userId } = globalStore.config;
  const isByMe =
    userId === (message as SendableMessageType)?.sender?.userId ||
    (message as SendableMessageType)?.sendingStatus === 'pending' ||
    (message as SendableMessageType)?.sendingStatus === 'failed';

  const showMenuItemCopy: boolean = isUserMessage(message as UserMessage);
  const showMenuItemEdit: boolean = !channel?.isEphemeral && isUserMessage(message as UserMessage) && isSentMessage(message) && isByMe;
  const showMenuItemResend: boolean = isFailedMessage(message) && message?.isResendable && isByMe;
  const showMenuItemDelete: boolean = !channel?.isEphemeral && !isPendingMessage(message) && isByMe;
  const showMenuItemOpenInChannel: boolean = onMoveToParentMessage !== null;
  /**
   * TODO: Manage timing issue
   * User delete pending message -> Sending message success
   */
  const isReplyTypeEnabled =
    !isFailedMessage(message) &&
    !isPendingMessage(message) &&
    channel?.isGroupChannel?.() &&
    !channel?.isEphemeral &&
    (((channel as GroupChannel)?.isBroadcast && channel?.myRole === Role.OPERATOR) || !(channel as GroupChannel)?.isBroadcast);
  const showMenuItemThread = isReplyTypeEnabled && replyType === 'THREAD' && !message?.parentMessageId && onReplyInThread;

  if (
    !(showMenuItemCopy || showMenuItemThread || showMenuItemOpenInChannel || showMenuItemEdit || showMenuItemResend || showMenuItemDelete)
  ) {
    return null;
  }
  return (
    <div className={getClassName([className, 'sendbird-message-item-menu'])} ref={containerRef}>
      <ContextMenu
        menuTrigger={(toggleDropdown: () => void): ReactElement => (
          <IconButton
            className="sendbird-message-item-menu__trigger"
            ref={triggerRef}
            width="24px"
            height="24px"
            onClick={(): void => {
              toggleDropdown();
              setSupposedHover(true);
            }}
            onBlur={(): void => {
              setSupposedHover(false);
            }}
          >
            <Icon
              className="sendbird-message-item-menu__trigger__icon"
              type={IconTypes.MORE}
              fillColor={IconColors.CONTENT_INVERSE}
              width="16px"
              height="16px"
            />
          </IconButton>
        )}
        menuItems={(close: () => void): ReactElement => {
          const closeDropdown = (): void => {
            close();
            setSupposedHover(false);
          };
          return (
            <MenuItems
              className="sendbird-message-item-menu__list"
              parentRef={triggerRef}
              parentContainRef={containerRef}
              closeDropdown={closeDropdown}
              openLeft={isByMe}
            >
              {showMenuItemCopy &&
                renderMenuItem({
                  className: 'sendbird-message-item-menu__list__menu-item menu-item-copy',
                  onClick: () => {
                    copyToClipboard((message as UserMessage)?.message);
                    closeDropdown();
                  },
                  dataSbId: 'ui_message_item_menu_copy',
                  text: stringSet.MESSAGE_MENU__COPY,
                })}
              {showMenuItemThread &&
                renderMenuItem({
                  className: 'sendbird-message-item-menu__list__menu-item menu-item-thread',
                  onClick: () => {
                    onReplyInThread?.({ message });
                    closeDropdown();
                  },
                  dataSbId: 'ui_message_item_menu_thread',
                  text: stringSet.MESSAGE_MENU__THREAD,
                })}
              {showMenuItemOpenInChannel &&
                renderMenuItem({
                  className: 'sendbird-message-item-menu__list__menu-item menu-item-open-channel',
                  onClick: () => {
                    onMoveToParentMessage?.();
                    closeDropdown();
                  },
                  dataSbId: 'ui_message_item_menu_open_in_channel',
                  text: stringSet.MESSAGE_MENU__OPEN_IN_CHANNEL,
                })}
              {showMenuItemEdit &&
                renderMenuItem({
                  className: 'sendbird-message-item-menu__list__menu-item menu-item-edit',
                  onClick: () => {
                    if (!disabled) {
                      showEdit(true);
                      closeDropdown();
                    }
                  },
                  dataSbId: 'ui_message_item_menu_edit',
                  text: stringSet.MESSAGE_MENU__EDIT,
                })}
              {showMenuItemResend &&
                renderMenuItem({
                  className: 'sendbird-message-item-menu__list__menu-item menu-item-resend',
                  onClick: () => {
                    if (!disabled) {
                      resendMessage(message);
                      closeDropdown();
                    }
                  },
                  dataSbId: 'ui_message_item_menu_resend',
                  text: stringSet.MESSAGE_MENU__RESEND,
                })}
              {showMenuItemDelete &&
                renderMenuItem({
                  className: 'sendbird-message-item-menu__list__menu-item menu-item-delete',
                  onClick: () => {
                    if (isFailedMessage(message)) {
                      deleteMessage?.(message);
                    } else if (!disabled) {
                      showRemove(true);
                      closeDropdown();
                    }
                  },
                  disable: typeof disableDeleteMessage === 'boolean' ? disableDeleteMessage : message?.threadInfo?.replyCount > 0,
                  dataSbId: 'ui_message_item_menu_delete',
                  text: stringSet.MESSAGE_MENU__DELETE,
                })}
            </MenuItems>
          );
        }}
      />
    </div>
  );
}

// MessageItemMenu - legacy name
export default MessageMenu;
