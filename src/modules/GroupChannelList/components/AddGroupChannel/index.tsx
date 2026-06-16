import React, { useState } from 'react';
import AddGroupChannelView from './AddGroupChannelView';
import { useGroupChannelList } from '../../context/useGroupChannelList';

export interface AddGroupChannelProps {
  userQuery?(): UserListQuery;
}

export const AddGroupChannel = (props: AddGroupChannelProps) => {
  const { userQuery } = props;
  const [createChannelVisible, setCreateChannelVisible] = useState(false);
  const {
    state: {
      onChannelCreated,
      onBeforeCreateChannel,
      onCreateChannelClick,
    },
  } = useGroupChannelList();

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
