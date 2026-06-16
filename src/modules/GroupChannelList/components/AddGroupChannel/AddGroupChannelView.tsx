import React from 'react';

import IconButton from '../../../../ui/IconButton';
// @emo-integration
import EmocionalAddChannelIcon from '../../../../emo/integration/add-group-channel';
import CreateChannel from '../../../CreateChannel';
import { CreateChannelProviderProps } from '../../../CreateChannel/context/CreateChannelProvider';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';

type Props = {
  createChannelVisible: boolean;
  onChangeCreateChannelVisible: (value: boolean) => void;
  onBeforeCreateChannel: CreateChannelProviderProps['onBeforeCreateChannel'];
  onCreateChannelClick: CreateChannelProviderProps['onCreateChannelClick'];
  onChannelCreated: CreateChannelProviderProps['onChannelCreated'];
  userQuery?(): UserListQuery;
};

export const AddGroupChannelView = ({
  createChannelVisible,
  onChangeCreateChannelVisible,
  onBeforeCreateChannel,
  onCreateChannelClick,
  onChannelCreated,
  userQuery,
}: Props) => {
  const { state: { config } } = useSendbird();

  return (
    <>
      <IconButton
        height={'32px'}
        width={'32px'}
        disabled={!config.isOnline}
        onClick={() => onChangeCreateChannelVisible(true)}
      >
        <EmocionalAddChannelIcon />
      </IconButton>
      <CreateChannel
        onCancel={() => onChangeCreateChannelVisible(false)}
        showCreateChannel={createChannelVisible}
        onChannelCreated={(channel) => {
          onChannelCreated?.(channel);
          onChangeCreateChannelVisible(false);
        }}
        onBeforeCreateChannel={onBeforeCreateChannel}
        onCreateChannelClick={onCreateChannelClick}
        userQuery={userQuery}
      />
    </>
  );
};

export default AddGroupChannelView;
