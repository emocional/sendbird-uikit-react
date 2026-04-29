import React from 'react';
import MessageInputWrapperView from '../../../GroupChannel/components/MessageInputWrapper/MessageInputWrapperView';
import { useChannelContext } from '../../context/ChannelProvider';
import { GroupChannelUIBasicProps } from '../../../GroupChannel/components/GroupChannelUI/GroupChannelUIView';

export interface MessageInputWrapperProps {
  value?: string;
  disabled?: boolean;
  acceptableMimeTypes?: string[];
  renderFileUploadIcon?: GroupChannelUIBasicProps['renderFileUploadIcon'];
  renderVoiceMessageIcon?: GroupChannelUIBasicProps['renderVoiceMessageIcon'];
  renderSendMessageIcon?: GroupChannelUIBasicProps['renderSendMessageIcon'];
}

/**
 * @deprecated This component is deprecated and will be removed in the next major update.
 * Please use the `GroupChannel` component from '@sendbird/uikit-react/GroupChannel' instead.
 * For more information, please refer to the migration guide:
 * https://docs.sendbird.com/docs/chat/uikit/v3/react/introduction/group-channel-migration-guide
 */
interface MessageBearingParams {
  message?: string;
  mentionedUsers?: import('@sendbird/chat').User[];
}

const buildExtras = (params: MessageBearingParams): { message?: string; mentionedUsers?: import('@sendbird/chat').User[]; mentionedMessageTemplate?: string } | undefined => {
  const template = (params as MessageBearingParams & { mentionedMessageTemplate?: string }).mentionedMessageTemplate;
  if (!params.message && !params.mentionedUsers && !template) return undefined;
  const extras: { message?: string; mentionedUsers?: import('@sendbird/chat').User[]; mentionedMessageTemplate?: string } = {};
  if (params.message) extras.message = params.message;
  if (params.mentionedUsers) extras.mentionedUsers = params.mentionedUsers;
  if (template) extras.mentionedMessageTemplate = template;
  return extras;
};

export const MessageInputWrapper = (props: MessageInputWrapperProps) => {
  const context = useChannelContext();
  const { quoteMessage, currentGroupChannel, sendMessage, sendFileMessage, sendVoiceMessage, sendMultipleFilesMessage } = context;

  return (
    <MessageInputWrapperView
      {...props}
      {...context}
      currentChannel={currentGroupChannel}
      messages={context.allMessages}
      sendUserMessage={(params) => {
        return sendMessage({
          message: params.message,
          mentionTemplate: params.mentionedMessageTemplate,
          mentionedUsers: params.mentionedUsers,
          quoteMessage: quoteMessage ?? undefined,
        });
      }}
      sendFileMessage={(params) => {
        const extras = buildExtras(params);
        return sendFileMessage(
          params.file as File,
          quoteMessage ?? undefined,
          extras,
        );
      }}
      sendVoiceMessage={({ file }, duration) => {
        return sendVoiceMessage(file as File, duration, quoteMessage ?? undefined);
      }}
      sendMultipleFilesMessage={(params) => {
        const extras = buildExtras(params);
        return sendMultipleFilesMessage(
          params.fileInfoList.map((fileInfo) => fileInfo.file) as File[],
          quoteMessage ?? undefined,
          extras,
        );
      }}
    />
  );
};

export default MessageInputWrapper;
