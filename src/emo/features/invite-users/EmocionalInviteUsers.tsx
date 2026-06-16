import React, { useContext, useEffect, useState } from 'react';
import type { User } from '@sendbird/chat';

import '../../../modules/CreateChannel/components/InviteUsers/invite-users.scss';
import { LocalizationContext } from '../../../lib/LocalizationContext';
import useSendbird from '../../../lib/Sendbird/context/hooks/useSendbird';
import { useMediaQueryContext } from '../../../lib/MediaQueryContext';
import Modal from '../../../ui/Modal';
import useCreateChannel from '../../../modules/CreateChannel/context/useCreateChannel';
import { filterUser } from '../../../modules/CreateChannel/components/InviteUsers/utils';
import { noop } from '../../../utils/utils';
import type { UserListQuery } from '../../../lib/Sendbird/types';
import { applyEmocionalUserListFilter } from '../../types/user-list-query';
import { createDistinctDirectChannel } from '../auto-create-channels/create-distinct-direct-channel';
import EmocionalModalSearchHeader from './EmocionalModalSearchHeader';
import EmocionalUserListItem from './EmocionalUserListItem';

export interface EmocionalInviteUsersProps {
  onCancel?: () => void;
  userListQuery?(): UserListQuery;
}

const BUFFER = 50;

/**
 * Flujo Emocional: búsqueda opcional, tap → canal distinct 1:1 (sin multi-select).
 * Sustituye InviteUsers upstream cuando `skipChannelTypeSelection` está activo.
 */
export const EmocionalInviteUsers = ({
  onCancel,
  userListQuery,
}: EmocionalInviteUsersProps): React.ReactElement | null => {
  const {
    state: {
      onCreateChannelClick,
      onBeforeCreateChannel,
      onChannelCreated,
      onCreateChannel,
      overrideInviteUser,
      type,
    },
    actions: { createChannel },
  } = useCreateChannel();

  const { state } = useSendbird();
  const { config } = state;
  const { userId, searcherFilter, logger } = config;
  const idsToFilter = [userId];
  const [users, setUsers] = useState<User[]>([]);
  const { stringSet } = useContext(LocalizationContext);
  const [usersDataSource, setUsersDataSource] = useState<UserListQuery | null>(null);
  const titleText = stringSet.MODAL__CREATE_CHANNEL__TITLE;
  const { isMobile } = useMediaQueryContext();
  const [scrollableAreaHeight, setScrollableAreaHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const query = userListQuery?.();
    if (!query || query.isLoading || !query.hasNext) {
      return;
    }

    setUsersDataSource(query);
    query.next().then((batch) => {
      setUsers(applyEmocionalUserListFilter(query, batch));
    });
  }, [userListQuery]);

  useEffect(() => {
    const updateHeight = () => setScrollableAreaHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleSubmit = async (selectedUserId: string) => {
    const selectedUserList = [selectedUserId];
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

    try {
      if (onBeforeCreateChannel) {
        const params = onBeforeCreateChannel(selectedUserList);
        const channel = await createChannel(params);
        _onChannelCreated?.(channel);
      } else {
        const channel = await createDistinctDirectChannel(state, selectedUserId, userId);
        _onChannelCreated?.(channel);
      }
    } catch (error) {
      logger?.error?.('EmocionalInviteUsers: failed to create channel', error);
    }

    onCancel?.();
  };

  return (
    <Modal
      isFullScreenOnMobile
      hideFooter
      titleText={titleText}
      onCancel={onCancel}
      renderHeader={() => (
        <EmocionalModalSearchHeader
          titleText={titleText}
          onSearchChange={searcherFilter}
          onCloseClick={onCancel}
        />
      )}
    >
      <div
        className="sendbird-create-channel--scroll"
        style={isMobile ? { height: `calc(${scrollableAreaHeight}px - 200px)` } : {}}
        onScroll={(event) => {
          if (!usersDataSource) {
            return;
          }
          const eventTarget = event.target as HTMLDivElement;
          const { hasNext, isLoading } = usersDataSource;
          const fetchMore = (
            eventTarget.clientHeight + eventTarget.scrollTop + BUFFER
          ) > eventTarget.scrollHeight;

          if (hasNext && fetchMore && !isLoading) {
            usersDataSource.next().then((usersBatch) => {
              setUsers((current) => [
                ...current,
                ...applyEmocionalUserListFilter(usersDataSource, usersBatch),
              ]);
            });
          }
        }}
      >
        {users.map((user) => (
          !filterUser(idsToFilter)(user.userId) && (
            <EmocionalUserListItem
              key={user.userId}
              user={user}
              onSelect={handleSubmit}
            />
          )
        ))}
      </div>
    </Modal>
  );
};

export default EmocionalInviteUsers;
