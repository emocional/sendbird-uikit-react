import React from 'react';

import './index.scss';
import useSendbirdStateContext from '../../../../hooks/useSendbirdStateContext';
import { useLocalization } from '../../../../lib/LocalizationContext';
import Avatar from '../../../../ui/Avatar';
import Label, { LabelColors, LabelTypography } from '../../../../ui/Label';

export interface GroupChannelListHeaderProps {
  renderTitle?: () => React.ReactElement;
  renderIconButton?: (props: void) => React.ReactElement;
  onEdit?: (props: void) => void;
  allowProfileEdit?: boolean;
}

export const GroupChannelListHeader = ({ renderTitle, renderIconButton, allowProfileEdit }: GroupChannelListHeaderProps) => {
  const { stores } = useSendbirdStateContext();
  const { user } = stores.userStore;

  const { stringSet } = useLocalization();

  return (
    <div className={['sendbird-channel-header', allowProfileEdit ? 'sendbird-channel-header--allow-edit' : ''].join(' ')}>
      {renderTitle?.() || (
        <div className="sendbird-channel-header__title" role="button" tabIndex={0} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="sendbird-channel-header__title__left">
            <Avatar width="32px" height="32px" src={user.profileUrl} alt={user.nickname} />
          </div>
          <Label
            className="sendbird-channel-header__title__right__name"
            type={LabelTypography.SUBTITLE_2}
            color={LabelColors.ONBACKGROUND_1}
          >
            {user.nickname || stringSet.NO_NAME}
          </Label>
        </div>
      )}
      <div className="sendbird-channel-header__right-icon">{renderIconButton?.()}</div>
    </div>
  );
};

export default GroupChannelListHeader;
