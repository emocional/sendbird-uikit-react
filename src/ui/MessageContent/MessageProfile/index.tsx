import React, { ReactElement, useRef } from 'react';
import '../index.scss';
import { isSendableMessage } from '../../../utils';
import ContextMenu, { MenuItems } from '../../ContextMenu';
import Avatar from '../../Avatar';
import UserProfile from '../../UserProfile';
import { MessageContentProps } from '../index';
import { useUserProfileContext } from '../../../lib/UserProfileContext';
import { classnames } from '../../../utils/utils';
// @emo-integration
import { EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT } from '../../../emo/integration/message-layout';

export interface MessageProfileProps extends MessageContentProps {
  className?: string;
  isByMe?: boolean;
  displayThreadReplies?: boolean;
  bottom?: string
}

export function MessageProfile({
  // Internal props
  className = '',
  isByMe,
  displayThreadReplies,
  bottom,
  // MessageContentProps
  message,
  channel,
  userId,
  chainTop = false,
  chainBottom = false,
}: MessageProfileProps) {
  const avatarRef = useRef(null);

  const { disableUserProfile, renderUserProfile } = useUserProfileContext();

  const hideAvatar = EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT
    ? chainTop
    : (isByMe || chainBottom);

  if (hideAvatar || !isSendableMessage(message)) {
    return null;
  }

  const avatarSize = EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT ? '40px' : '28px';

  return (
    <ContextMenu
      menuTrigger={(toggleDropdown: () => void): ReactElement => (
        <Avatar
          className={classnames(
            className,
            displayThreadReplies && 'use-thread-replies',
            EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT && 'emo-message-avatar',
          )}
          src={
            channel?.members?.find((member) => member?.userId === message.sender.userId)?.profileUrl
            || message.sender.profileUrl
            || ''
          }
          // TODO: Divide getting profileUrl logic to utils
          ref={avatarRef}
          width={avatarSize}
          height={avatarSize}
          bottom={bottom}
          onClick={(): void => {
            if (!disableUserProfile) toggleDropdown();
          }}
        />
      )}
      menuItems={(closeDropdown) => (
        renderUserProfile ? (
          renderUserProfile({
            user: message.sender,
            close: closeDropdown,
            currentUserId: userId,
            avatarRef,
          })
        ) : (
          <MenuItems
            /**
             * parentRef: For catching location(x, y) of MenuItems
             * parentContainRef: For toggling more options(menus & reactions)
            */
            parentRef={avatarRef}
            parentContainRef={avatarRef}
            closeDropdown={closeDropdown}
            style={{ paddingTop: '0px', paddingBottom: '0px' }}
          >
            <UserProfile user={message.sender} onSuccess={closeDropdown} />
          </MenuItems>
        )
      )}
    />
  );
}

export default MessageProfile;
