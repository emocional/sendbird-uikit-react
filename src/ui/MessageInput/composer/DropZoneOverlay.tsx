import React, { ReactElement, useContext } from 'react';

import Icon, { IconColors, IconTypes } from '../../Icon';
import Label, { LabelColors, LabelTypography } from '../../Label';
import { LocalizationContext } from '../../../lib/LocalizationContext';

interface Props {
  visible: boolean;
}

export const DropZoneOverlay = ({ visible }: Props): ReactElement | null => {
  const { stringSet } = useContext(LocalizationContext);

  if (!visible) return null;

  return (
    <div
      className="sendbird-message-input__drop-overlay"
      data-testid="sendbird-drop-overlay"
      role="presentation"
    >
      <div className="sendbird-message-input__drop-overlay__inner">
        <Icon
          type={IconTypes.ATTACH}
          fillColor={IconColors.PRIMARY}
          width="32px"
          height="32px"
        />
        <Label
          className="sendbird-message-input__drop-overlay__label"
          type={LabelTypography.SUBTITLE_1}
          color={LabelColors.ONBACKGROUND_1}
        >
          {stringSet.MESSAGE_INPUT__DROP_ZONE__LABEL}
        </Label>
      </div>
    </div>
  );
};

export default DropZoneOverlay;
