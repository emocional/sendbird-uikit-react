import React, { type MouseEvent } from 'react';

import IconButton from '../../../ui/IconButton';
import Icon, { IconColors, IconTypes } from '../../../ui/Icon';
import Label, { LabelColors, LabelTypography } from '../../../ui/Label';

import './emocional-modal-search-header.scss';

export interface EmocionalModalSearchHeaderProps {
  titleText: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onCloseClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const EmocionalModalSearchHeader = ({
  titleText,
  searchPlaceholder = 'Buscar',
  onSearchChange,
  onCloseClick,
}: EmocionalModalSearchHeaderProps): React.ReactElement => (
  <div className="sendbird-modal__header emo-modal-search-header">
    {onSearchChange ? (
      <input
        className="emo-modal-search-header__input"
        placeholder={searchPlaceholder}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    ) : (
      <Label type={LabelTypography.H_1} color={LabelColors.ONBACKGROUND_1}>
        {titleText}
      </Label>
    )}
    <div className="sendbird-modal__close">
      <IconButton
        width="32px"
        height="32px"
        onClick={(event) => {
          onSearchChange?.('');
          onCloseClick?.(event);
        }}
      >
        <Icon type={IconTypes.CLOSE} fillColor={IconColors.DEFAULT} width="24px" height="24px" />
      </IconButton>
    </div>
  </div>
);

export default EmocionalModalSearchHeader;
