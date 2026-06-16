import React, { ReactElement } from 'react';

import './index.scss';

import {
  Colors,
  changeColorToClassName,
} from '../../utils/color';

import Label, { LabelTypography, LabelColors } from '../Label';
// @emo-integration
import { resolveEmocionalDateSeparatorColor } from '../../emo/integration/date-separator';

export interface DateSeparatorProps {
  children?: string | ReactElement;
  className?: string | Array<string>;
  separatorColor?: Colors;
}

const DateSeparator = ({
  children = undefined,
  className = '',
  separatorColor = resolveEmocionalDateSeparatorColor(),
}: DateSeparatorProps): ReactElement => {

  return (
    <div
      className={[
        ...(Array.isArray(className) ? className : [className]),
        'sendbird-separator',
      ].join(' ')}
    >
      <div className={['sendbird-separator__left', `${changeColorToClassName(separatorColor)}--background-color`].join(' ')} />
      <div className="sendbird-separator__text">
        {
          children
          || (
            <Label type={LabelTypography.CAPTION_2} color={LabelColors.ONBACKGROUND_2}>
              Date Separator
            </Label>
          )
        }
      </div>
      <div className={['sendbird-separator__right', `${changeColorToClassName(separatorColor)}--background-color`].join(' ')} />
    </div>
  );
};

export default DateSeparator;
