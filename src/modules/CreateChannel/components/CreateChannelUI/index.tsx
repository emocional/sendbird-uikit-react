import './create-channel-ui.scss';

import React, { useEffect } from 'react';

import InviteUsers from '../InviteUsers';

import SelectChannelType from '../SelectChannelType';
import useCreateChannel from '../../context/useCreateChannel';
// @emo-integration
import EmocionalCreateChannelInvite, { useEmocionalSkipChannelTypeSelection } from '../../../../emo/integration/create-channel';

export interface CreateChannelUIProps {
  onCancel?(): void;
  renderStepOne?: (props: void) => React.ReactElement;
  userQuery?(): UserListQuery;
  showCreateChannel?: boolean;
}

const CreateChannel: React.FC<CreateChannelUIProps> = (props: CreateChannelUIProps) => {
  const { onCancel, renderStepOne } = props;
  const skipChannelTypeSelection = useEmocionalSkipChannelTypeSelection();

  const {
    state: {
      pageStep,
      userListQuery,
    },
    actions: {
      setPageStep,
    },
  } = useCreateChannel();

  useEffect(() => {
    if (skipChannelTypeSelection && pageStep === 0) {
      setPageStep(1);
    }
  }, [skipChannelTypeSelection, pageStep, setPageStep]);

  const handleInviteCancel = () => {
    if (skipChannelTypeSelection) {
      onCancel?.();
      return;
    }
    setPageStep(0);
    onCancel?.();
  };

  return (
    <>
      {
        !skipChannelTypeSelection && pageStep === 0 && (
          renderStepOne?.() || (
            <SelectChannelType
              onCancel={onCancel}
            />
          )
        )
      }
      {
        pageStep === 1 && (
          skipChannelTypeSelection ? (
            <EmocionalCreateChannelInvite
              userListQuery={userListQuery}
              onCancel={handleInviteCancel}
            />
          ) : (
            <InviteUsers
              userListQuery={userListQuery}
              onCancel={handleInviteCancel}
            />
          )
        )
      }
    </>
  );
};

export default CreateChannel;
