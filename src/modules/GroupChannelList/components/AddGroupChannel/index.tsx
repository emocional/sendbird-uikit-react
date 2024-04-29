import React, { useState } from 'react';
import AddGroupChannelView from './AddGroupChannelView';
import { useGroupChannelListContext } from '../../context/GroupChannelListProvider';
import { UserListQuery } from '../../../../types';

export interface AddGroupChannelProps {
  userQuery?(): UserListQuery;
  showCreateChannel?: boolean;
}

export const AddGroupChannel = (props: AddGroupChannelProps) => {
  const { userQuery, showCreateChannel } = props;
  const [createChannelVisible, setCreateChannelVisible] = useState(!!showCreateChannel);
  const { onChannelCreated, onBeforeCreateChannel, onCreateChannelClick } = useGroupChannelListContext();

  return (
    <AddGroupChannelView
      createChannelVisible={createChannelVisible}
      onChangeCreateChannelVisible={setCreateChannelVisible}
      onCreateChannelClick={onCreateChannelClick}
      onBeforeCreateChannel={onBeforeCreateChannel}
      onChannelCreated={onChannelCreated}
      userQuery={userQuery}
    />
  );
};

export default AddGroupChannel;
