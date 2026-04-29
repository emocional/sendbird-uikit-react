import './index.scss';
import React, { ReactElement, useMemo } from 'react';
import type { FileMessage, MultipleFilesMessage } from '@sendbird/chat/message';

import Label, { LabelColors, LabelTypography } from '../Label';
import { tokenizeMessage } from '../../modules/Message/utils/tokens/tokenize';
import TextFragment from '../../modules/Message/components/TextFragment';

interface Props {
  message: FileMessage | MultipleFilesMessage;
  isByMe?: boolean;
  isMentionEnabled?: boolean;
  isMarkdownEnabled?: boolean;
}

/**
 * Caption above a file/MFM bubble. Renders message.message as a styled text
 * block. Mentions are tokenized when the FileMessage carries the same
 * mentionedMessageTemplate the SDK uses for UserMessage (server-side field
 * not in the TS class definition).
 * Returns null when there is no body text — pre-existing FileMessages have
 * empty body and render nothing.
 */
export default function FileMessageCaption({
  message,
  isByMe = false,
  isMentionEnabled = false,
  isMarkdownEnabled = false,
}: Props): ReactElement | null {
  const body = (message?.message ?? '').trim();
  // The SDK's FileMessage class does not declare mentionedMessageTemplate, but
  // it carries one on the server when sent with composer. Read it defensively.
  const mentionTemplate = (message as unknown as { mentionedMessageTemplate?: string })?.mentionedMessageTemplate;
  const mentionedUsers = message?.mentionedUsers;

  const tokens = useMemo(() => {
    const hasMentions = isMentionEnabled
      && mentionTemplate
      && mentionTemplate.length > 0
      && mentionedUsers
      && mentionedUsers.length > 0;
    if (hasMentions) {
      return tokenizeMessage({
        mentionedUsers: mentionedUsers ?? undefined,
        messageText: mentionTemplate,
        includeMarkdown: isMarkdownEnabled,
      });
    }
    return tokenizeMessage({
      messageText: message?.message ?? '',
      includeMarkdown: isMarkdownEnabled,
    });
  }, [message?.updatedAt, message?.message, mentionTemplate, mentionedUsers, isMentionEnabled, isMarkdownEnabled]);

  if (body.length === 0) return null;

  return (
    <Label
      type={LabelTypography.BODY_1}
      color={isByMe ? LabelColors.ONCONTENT_1 : LabelColors.ONBACKGROUND_1}
    >
      <div
        className={`sendbird-file-message-caption ${isByMe ? 'outgoing' : 'incoming'}`}
        data-testid="sendbird-file-message-caption"
      >
        <TextFragment tokens={tokens} />
      </div>
    </Label>
  );
}
