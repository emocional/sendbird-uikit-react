import React from 'react';

import EmocionalInviteUsers from '../features/invite-users/EmocionalInviteUsers';
import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';
import type { UserListQuery } from '../../lib/Sendbird/types';

export interface EmocionalCreateChannelInviteProps {
  onCancel?: () => void;
  userListQuery?(): UserListQuery;
}

/** Invite modal Emocional (distinct 1:1 + búsqueda). */
export const EmocionalCreateChannelInvite = (props: EmocionalCreateChannelInviteProps): React.ReactElement => (
  <EmocionalInviteUsers {...props} />
);

export const useEmocionalSkipChannelTypeSelection = (): boolean => {
  const {
    state: {
      config: { skipChannelTypeSelection },
    },
  } = useSendbird();
  return skipChannelTypeSelection !== false;
};

export default EmocionalCreateChannelInvite;
