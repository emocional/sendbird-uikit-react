import React from 'react';

import Icon, { IconColors, IconTypes } from '../../ui/Icon';

/** Icono "+" del fork Emocional (color de marca). */
export const EmocionalAddChannelIcon = (): React.ReactElement => (
  <Icon
    type={IconTypes.PLUS}
    fillColor={IconColors.EMOCIONAL}
    width="24px"
    height="24px"
  />
);

export default EmocionalAddChannelIcon;
