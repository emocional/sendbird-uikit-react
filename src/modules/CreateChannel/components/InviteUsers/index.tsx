import React, { useContext, useEffect, useState } from 'react';
import type { User } from '@sendbird/chat';
import type { GroupChannelCreateParams } from '@sendbird/chat/groupChannel';

import './invite-users.scss';
import { LocalizationContext } from '../../../../lib/LocalizationContext';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
import { useMediaQueryContext } from '../../../../lib/MediaQueryContext';
import Modal from '../../../../ui/Modal';
import Label, { LabelColors, LabelTypography } from '../../../../ui/Label';
import { ButtonTypes } from '../../../../ui/Button';
import UserListItem from '../../../../ui/UserListItem';

import { createDefaultUserListQuery, filterUser, setChannelType } from './utils';
import { noop } from '../../../../utils/utils';
import { UserListQuery } from '../../../../types';
import useCreateChannel from '../../context/useCreateChannel';

export interface InviteUsersProps {
  onCancel?: () => void;
  showCreateChannel?: boolean;
  userListQuery?(): UserListQuery;
}

const BUFFER = 50;

const InviteUsers: React.FC<InviteUsersProps> = ({
  onCancel,
  userListQuery,
}: InviteUsersProps) => {
  const {
    state: {
      onCreateChannelClick,
      onBeforeCreateChannel,
      onChannelCreated,
      onCreateChannel,
      overrideInviteUser,
      type,
    },
    actions: {
      createChannel,
    },
  } = useCreateChannel();

  const { state: { config: { userId }, stores: { sdkStore: { sdk } } } } = useSendbird();
  const idsToFilter = [userId];
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const { stringSet } = useContext(LocalizationContext);
  const [usersDataSource, setUsersDataSource] = useState<UserListQuery | null>(null);
  const titleText = stringSet.MODAL__CREATE_CHANNEL__TITLE;
  const { isMobile } = useMediaQueryContext();
  const [scrollableAreaHeight, setScrollableAreaHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const applicationUserListQuery = userListQuery ? userListQuery() : createDefaultUserListQuery({ sdk });
    setUsersDataSource(applicationUserListQuery);
    if (!applicationUserListQuery?.isLoading) {
      applicationUserListQuery.next().then((it) => {
        setUsers(it);
      });
    }
  }, [userQueryCreator]);

  // To fix navbar break in mobile we set dynamic height to the scrollable area
  useEffect(() => {
    const scrollableAreaHeight = () => {
      setScrollableAreaHeight(window.innerHeight);
    };
    window.addEventListener('resize', scrollableAreaHeight);
    return () => {
      window.removeEventListener('resize', scrollableAreaHeight);
    };
  }, []);

  useEffect(() => {
    if (!!createChatAuto) {
      for (let i = 0; i < users.length; i++) {
        handleSubmit(users[i].userId);
      }
    }
  }, [users]);

  const handleSubmit = (id: string) => {
    const selectedUserList = [id];
    const _onChannelCreated = onChannelCreated ?? onCreateChannel;
    const _onCreateChannelClick = onCreateChannelClick ?? overrideInviteUser;

    if (typeof _onCreateChannelClick === 'function') {
      _onCreateChannelClick({
        users: selectedUserList,
        onClose: onCancel ?? noop,
        channelType: type,
      });
      return;
    }

    if (onBeforeCreateChannel) {
      const params = onBeforeCreateChannel(selectedUserList);
      setChannelType(params, type);
      createChannel(params).then((channel) => _onChannelCreated?.(channel));
    } else {
      const params: GroupChannelCreateParams = {};
      params.invitedUserIds = selectedUserList;
      params.isDistinct = true;
      if (userId) {
        params.operatorUserIds = [userId];
      }
      setChannelType(params, type);
      // do not have custom params
      createChannel(params).then((channel) => _onChannelCreated?.(channel));
    }
    onCancel?.();
  };

  return !!showCreateChannel ? (
    <Modal isFullScreenOnMobile titleText={titleText} onCancel={onCancel} hideFooter setSearcher={searcherFilter}>
      <div
        className="sendbird-create-channel--scroll"
        style={isMobile ? { height: `calc(${scrollableAreaHeight}px - 200px)` } : {}}
        onScroll={(e) => {
          if (!usersDataSource) return;
          const eventTarget = e.target as HTMLDivElement;
          const { hasNext, isLoading } = usersDataSource;
          const fetchMore = eventTarget.clientHeight + eventTarget.scrollTop + BUFFER > eventTarget.scrollHeight;

          if (hasNext && fetchMore && !isLoading) {
            usersDataSource.next().then((usersBatch) => {
              if ('filterFn' in usersDataSource && usersDataSource.filterFn !== undefined) {
                usersBatch = usersBatch.filter(usersDataSource.filterFn);
              }
              setUsers([...users, ...usersBatch]);
            });
          }
        }}
      >
        {users.map(
          (user) =>
            !filterUser(idsToFilter)(user.userId) && <UserListItem key={user.userId} user={user} onSubmit={(item) => handleSubmit(item)} />
        )}
      </div>
    </Modal>
  ) : null;
};

export default InviteUsers;
