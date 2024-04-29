import './create-channel-ui.scss';

import React from 'react';

import { UserListQuery, useCreateChannelContext } from '../../context/CreateChannelProvider';
import InviteUsers from '../InviteUsers';

export interface CreateChannelUIProps {
  onCancel?(): void;
  renderStepOne?: (props: void) => React.ReactElement;
  userQuery?(): UserListQuery;
  showCreateChannel?: boolean;
}

const CreateChannel: React.FC<CreateChannelUIProps> = (props: CreateChannelUIProps) => {
  const { onCancel, userQuery, showCreateChannel } = props;

  const { userListQuery } = useCreateChannelContext();

  return (
    <>
      <InviteUsers
        userListQuery={userQuery || userListQuery}
        showCreateChannel={showCreateChannel}
        onCancel={() => {
          onCancel();
        }}
      />
    </>
  );
};

export default CreateChannel;
