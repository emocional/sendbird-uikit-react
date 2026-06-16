import React from 'react';
import format from 'date-fns/format';

import Label, { LabelColors, LabelTypography } from '../../ui/Label';
import { MessageHeaderProps } from '../../ui/MessageContent/MessageHeader';
import { getSenderName, SendableMessageType } from '../../utils';
import { Member } from '@sendbird/chat/groupChannel';
import { useLocalization } from '../../lib/LocalizationContext';

/** Cabecera de mensaje: nombre en negrita + hora en la misma fila. */
export function EmocionalMessageHeader(props: MessageHeaderProps) {
  const { channel, message } = props;
  const { dateLocale, stringSet } = useLocalization();

  const senderName = channel?.members?.find((member: Member) => (
    member?.userId === message?.sender?.userId
  ))?.nickname || getSenderName(message as SendableMessageType);

  return (
    <div className="emo-message-header">
      <Label
        className="emo-message-header__name sendbird-message-content__middle__sender-name"
        type={LabelTypography.CAPTION_2}
        color={LabelColors.ONBACKGROUND_2}
      >
        {senderName}
      </Label>
      <Label
        className="emo-message-header__time"
        type={LabelTypography.CAPTION_3}
        color={LabelColors.ONBACKGROUND_3}
      >
        {format(message?.createdAt || 0, stringSet.DATE_FORMAT__MESSAGE_CREATED_AT, {
          locale: dateLocale,
        })}
      </Label>
    </div>
  );
}
