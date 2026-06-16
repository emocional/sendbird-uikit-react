import React from 'react';
import format from 'date-fns/format';

import Label, { LabelColors, LabelTypography } from '../../ui/Label';
import MessageStatus from '../../ui/MessageStatus';
import { MessageHeaderProps } from '../../ui/MessageContent/MessageHeader';
import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';
import { getSenderName, SendableMessageType } from '../../utils';
import { Member } from '@sendbird/chat/groupChannel';
import { useLocalization } from '../../lib/LocalizationContext';

/** Cabecera de mensaje: nombre + hora (o estado de envío con hora en mensajes propios). */
export function EmocionalMessageHeader(props: MessageHeaderProps) {
  const { channel, message } = props;
  const { dateLocale, stringSet } = useLocalization();
  const { state: { config: { userId } } } = useSendbird();
  const sendableMessage = message as SendableMessageType;
  const senderUserId = sendableMessage.sender?.userId;
  const isOwnMessage = senderUserId === userId;

  const senderName = channel?.members?.find((member: Member) => (
    member?.userId === senderUserId
  ))?.nickname || getSenderName(sendableMessage);

  return (
    <div className="emo-message-header">
      <Label
        className="emo-message-header__name"
        type={LabelTypography.CAPTION_2}
        color={LabelColors.ONBACKGROUND_2}
      >
        {senderName}
      </Label>
      {isOwnMessage ? (
        <MessageStatus
          className="emo-message-header__status"
          message={message}
          channel={channel}
        />
      ) : (
        <Label
          className="emo-message-header__time"
          type={LabelTypography.CAPTION_3}
          color={LabelColors.ONBACKGROUND_3}
        >
          {format(message?.createdAt || 0, stringSet.DATE_FORMAT__MESSAGE_CREATED_AT, {
            locale: dateLocale,
          })}
        </Label>
      )}
    </div>
  );
}
