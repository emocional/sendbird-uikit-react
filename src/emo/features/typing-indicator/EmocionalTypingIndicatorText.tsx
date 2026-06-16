import React, { useContext } from 'react';
import type { Member } from '@sendbird/chat/groupChannel';

import { LocalizationContext } from '../../../lib/LocalizationContext';

export interface EmocionalTypingIndicatorTextProps {
  members: Member[];
}

/**
 * Indicador de escritura del fork: nickname morado en un solo usuario;
 * sin caso explícito de dos usuarios (va a múltiples genérico).
 */
export const EmocionalTypingIndicatorText = ({
  members,
}: EmocionalTypingIndicatorTextProps): React.ReactElement => {
  const { stringSet } = useContext(LocalizationContext);

  if (!members || members.length === 0) {
    return <></>;
  }

  if (members.length === 1) {
    return (
      <>
        <span className="emo-typing-indicator__nickname">{members[0].nickname}</span>
        {' '}
        {stringSet.TYPING_INDICATOR__IS_TYPING}
      </>
    );
  }

  return <>{stringSet.TYPING_INDICATOR__MULTIPLE_TYPING}</>;
};

export default EmocionalTypingIndicatorText;
