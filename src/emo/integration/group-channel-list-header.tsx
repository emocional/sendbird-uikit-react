import React from 'react';

import Avatar from '../../ui/Avatar';
import Label, { LabelColors, LabelTypography } from '../../ui/Label';
import { useLocalization } from '../../lib/LocalizationContext';
import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';

/** Cabecera de lista simplificada: avatar + nickname (sin userId ni onEdit). */
export const EmocionalGroupChannelListHeaderTitle = (): React.ReactElement => {
  const { state: { stores: { userStore: { user } } } } = useSendbird();
  const { stringSet } = useLocalization();

  return (
    <div className="sendbird-channel-header__title emo-channel-list-header__title">
      <div className="sendbird-channel-header__title__left">
        <Avatar
          width="32px"
          height="32px"
          src={user.profileUrl}
          alt={user.nickname}
        />
      </div>
      <Label
        className="sendbird-channel-header__title__right__name"
        type={LabelTypography.SUBTITLE_2}
        color={LabelColors.ONBACKGROUND_1}
      >
        {user.nickname || stringSet.NO_NAME}
      </Label>
    </div>
  );
};

export default EmocionalGroupChannelListHeaderTitle;
