import React, { ChangeEvent, MutableRefObject, ReactElement, useContext } from 'react';
import { User } from '@sendbird/chat';
import { Member } from '@sendbird/chat/groupChannel';
import './index.scss';

import { UserProfileContext } from '../../lib/UserProfileContext';
import { LocalizationContext } from '../../lib/LocalizationContext';
import Avatar from '../Avatar/index';
import MutedAvatarOverlay from '../Avatar/MutedAvatarOverlay';
import Checkbox from '../Checkbox';
import UserProfile from '../UserProfile';
import ContextMenu, { MenuItems } from '../ContextMenu';
import Label, { LabelTypography, LabelColors } from '../Label';
import { getGlobalUserTag } from './utils';

export interface UserListItemProps {
  user: User | Member;
  className?: string;
  checked?: boolean;
  checkBox?: boolean;
  isOperator?: boolean;
  disabled?: boolean;
  disableMessaging?: boolean;
  currentUser?: string;
  action?({ actionRef, parentRef }: { actionRef: MutableRefObject<any>; parentRef?: MutableRefObject<any> }): ReactElement;
  onChange?(e: ChangeEvent<HTMLInputElement>): void;
  avatarSize?: string;
  /** @deprecated Please use the onUserAvatarClick instead */
  onClick?(): void;
  onUserAvatarClick?(): void;
  onSubmit?: (item: string) => void;
}

export default function UserListItem({
  user,
  className,
  checked,
  checkBox,
  isOperator,
  disabled,
  disableMessaging,
  currentUser,
  action,
  onChange,
  avatarSize = '40px',
  onClick,
  onUserAvatarClick,
  onSubmit,
}: UserListItemProps): ReactElement {
  const operator = isOperator ?? (user as Member)?.role === 'operator';
  const uniqueKey = user.userId;
  const actionRef = React.useRef(null);
  const parentRef = React.useRef(null);
  const avatarRef = React.useRef(null);
  const { disableUserProfile, renderUserProfile } = useContext(UserProfileContext);
  const { stringSet } = useContext(LocalizationContext);
  return (
    <div
      className={[...(Array.isArray(className) ? className : [className]), 'sendbird-user-list-item'].join(' ')}
      ref={parentRef}
      style={{ cursor: 'pointer' }}
      onClick={() => onSubmit(user.userId)}
    >
      {(user as Member)?.isMuted && <MutedAvatarOverlay height={40} width={40} />}
      <ContextMenu
        menuTrigger={(toggleDropdown) => (
          <Avatar
            className="sendbird-user-list-item__avatar"
            ref={avatarRef}
            src={user?.profileUrl || user?.plainProfileUrl || ''}
            width={avatarSize}
            height={avatarSize}
            onClick={() => {
              if (!disableUserProfile) {
                toggleDropdown();
                (onUserAvatarClick ?? onClick)?.();
              }
            }}
          />
        )}
        menuItems={(closeDropdown) =>
          renderUserProfile ? (
            renderUserProfile({
              user,
              currentUserId: currentUser,
              close: closeDropdown,
              avatarRef,
            })
          ) : (
            <MenuItems
              openLeft
              parentRef={avatarRef}
              // for catching location(x, y) of MenuItems
              parentContainRef={avatarRef}
              // for toggling more options(menus & reactions)
              closeDropdown={closeDropdown}
              style={{ paddingTop: '0px', paddingBottom: '0px' }}
            >
              <UserProfile disableMessaging={disableMessaging} user={user} currentUserId={currentUser} onSuccess={closeDropdown} />
            </MenuItems>
          )
        }
      />
      <Label className="sendbird-user-list-item__title" type={LabelTypography.SUBTITLE_1} color={LabelColors.ONBACKGROUND_1}>
        {user.nickname || stringSet.NO_NAME}
        {currentUser === user.userId && stringSet.CHANNEL_SETTING__MEMBERS__YOU}
      </Label>
      {user?.metaData['professional'] && (
        <div
          style={{
            top: 17,
            right: 25,
            fontSize: 12,
            color: 'black',
            borderRadius: 99999,
            position: 'absolute',
            padding: '4px 8px 4px 8px',
            backgroundColor: '#FAFAFAFF',
          }}
        >
          {getGlobalUserTag(user.metaData['professional'])}
        </div>
      )}
      {
        // if there is now nickname, display userId
        !user.nickname && (
          <Label className="sendbird-user-list-item__subtitle" type={LabelTypography.CAPTION_3} color={LabelColors.ONBACKGROUND_2}>
            {user.userId}
          </Label>
        )
      }
      {checkBox && (
        <label className="sendbird-user-list-item__checkbox" htmlFor={uniqueKey}>
          <Checkbox id={uniqueKey} checked={checked} disabled={disabled} onChange={(event) => onChange(event)} />
        </label>
      )}
      {operator && (
        <Label
          className={['sendbird-user-list-item__operator', checkBox ? 'checkbox' : ''].join(' ')}
          type={LabelTypography.SUBTITLE_2}
          color={LabelColors.ONBACKGROUND_2}
        >
          {stringSet.LABEL__OPERATOR}
        </Label>
      )}
      {action && (
        <div className="sendbird-user-list-item__action" ref={actionRef}>
          {action({ actionRef, parentRef })}
        </div>
      )}
    </div>
  );
}
