import './index.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { useTypingLifecycle } from '../../../../hooks/useTypingLifecycle';
import type { User } from '@sendbird/chat';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type {
  BaseMessage,
  FileMessage,
  FileMessageCreateParams,
  MultipleFilesMessage,
  MultipleFilesMessageCreateParams,
  UserMessage,
  UserMessageCreateParams,
} from '@sendbird/chat/message';

import {
  isDisabledBecauseFrozen,
  isDisabledBecauseMuted,
  isDisabledBecauseSuggestedReplies,
  isDisabledBecauseMessageForm,
} from '../../context/utils';
import { useLocalization } from '../../../../lib/LocalizationContext';
import { useGlobalModalContext } from '../../../../hooks/useModal';
import SuggestedMentionList from '../SuggestedMentionList';
import { useDirtyGetMentions } from '../../../Message/hooks/useDirtyGetMentions';
import { SendableMessageType } from '../../../../utils';
import QuoteMessageInput from '../../../../ui/QuoteMessageInput';
import VoiceMessageInputWrapper from './VoiceMessageInputWrapper';
import MessageInput from '../../../../ui/MessageInput';
import type { PendingFile } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { usePendingFiles } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { useMediaQueryContext } from '../../../../lib/MediaQueryContext';
import { MessageInputKeys } from '../../../../ui/MessageInput/const';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
import { compressImages } from '../../../../utils/compressImages';

export interface MessageInputWrapperViewProps {
  // Basic
  value?: string;
  disabled?: boolean;
  // ChannelContext
  currentChannel: GroupChannel | null;
  messages: BaseMessage[];
  isMultipleFilesMessageEnabled?: boolean;
  loading: boolean;
  quoteMessage: SendableMessageType | null;
  setQuoteMessage: React.Dispatch<React.SetStateAction<SendableMessageType | null>>;
  messageInputRef: React.RefObject<HTMLDivElement>;
  sendUserMessage: (params: UserMessageCreateParams) => Promise<UserMessage> | void;
  sendFileMessage: (params: FileMessageCreateParams) => Promise<FileMessage>;
  sendVoiceMessage: (params: FileMessageCreateParams, duration: number) => Promise<FileMessage>;
  sendMultipleFilesMessage: (params: MultipleFilesMessageCreateParams) => Promise<MultipleFilesMessage>;
  // render
  renderUserMentionItem?: (props: { user: User }) => React.ReactElement;
  renderFileUploadIcon?: () => React.ReactElement;
  renderVoiceMessageIcon?: () => React.ReactElement;
  renderSendMessageIcon?: () => React.ReactElement;
  acceptableMimeTypes?: string[];
}

export const MessageInputWrapperView = React.forwardRef((
  props: MessageInputWrapperViewProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  // Props
  const {
    currentChannel,
    messages,
    loading,
    quoteMessage,
    setQuoteMessage,
    messageInputRef,
    sendUserMessage,
    sendFileMessage,
    sendVoiceMessage,
    sendMultipleFilesMessage,
    // render
    renderUserMentionItem,
    renderFileUploadIcon,
    renderVoiceMessageIcon,
    renderSendMessageIcon,
    acceptableMimeTypes,
    disabled,
  } = props;
  const { stringSet } = useLocalization();
  const { isMobile } = useMediaQueryContext();
  const { openModal } = useGlobalModalContext();
  const { state } = useSendbird();
  const { stores, config } = state;
  const { isOnline, userMention, logger, groupChannel, imageCompression } = config;
  const sdk = stores.sdkStore.sdk;
  const { maxMentionCount, maxSuggestionCount } = userMention;
  const { uikitUploadSizeLimit, uikitMultipleFilesMessageLimit } = config;

  const isBroadcast = currentChannel?.isBroadcast;
  const isOperator = currentChannel?.myRole === 'operator';
  const isMultipleFilesMessageEnabled = props.isMultipleFilesMessageEnabled ?? config.isMultipleFilesMessageEnabled;
  const isMentionEnabled = groupChannel.enableMention;
  const isVoiceMessageEnabled = groupChannel.enableVoiceMessage;

  // States
  const [mentionNickname, setMentionNickname] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mentionSuggestedUsers, setMentionSuggestedUsers] = useState<User[]>([]);
  const [messageInputEvent, setMessageInputEvent] = useState<React.KeyboardEvent<HTMLDivElement> | null>(null);
  const [showVoiceMessageInput, setShowVoiceMessageInput] = useState(false);

  // Conditions
  const isMessageInputDisabled = loading
    || (!currentChannel || !sdk)
    || (!sdk.isCacheEnabled && !isOnline)
    || isDisabledBecauseFrozen(currentChannel)
    || isDisabledBecauseMuted(currentChannel)
    || isDisabledBecauseSuggestedReplies(currentChannel, config.groupChannel.enableSuggestedReplies)
    || isDisabledBecauseMessageForm(messages, config.groupChannel.enableFormTypeMessage)
    || disabled;

  const showSuggestedMentionList = !isMessageInputDisabled
    && isMentionEnabled
    && mentionNickname.length > 0
    && !isBroadcast;
  const mentionNodes = useDirtyGetMentions({ ref: (ref || messageInputRef) as any }, { logger });
  const ableMention = mentionNodes?.length < maxMentionCount;

  // Composer staging — file picker, drag-drop, and clipboard paste all feed
  // into pendingFiles. The submit handler drains them along with any text body.
  const {
    pendingFiles,
    addFiles,
    removeFile,
    clear: clearPendingFiles,
  } = usePendingFiles({
    uikitUploadSizeLimit,
    uikitMultipleFilesMessageLimit,
    openModal,
    stringSet,
    logger,
  });

  // Operate states
  useEffect(() => {
    setMentionNickname('');
    setMentionedUsers([]);
    setMentionedUserIds([]);
    setSelectedUser(null);
    setMentionSuggestedUsers([]);
    setMessageInputEvent(null);
    setShowVoiceMessageInput(false);
    clearPendingFiles();
  }, [currentChannel?.url]);

  const { startTyping, stopTyping } = useTypingLifecycle(currentChannel);
  useEffect(() => {
    setMentionedUsers(
      mentionedUsers.filter(({ userId }) => {
        const i = mentionedUserIds.indexOf(userId);
        if (i < 0) {
          return false;
        } else {
          mentionedUserIds.splice(i, 1);
          return true;
        }
      }),
    );
  }, [mentionedUserIds]);

  // Submit handler: drains pendingFiles + text body in one transaction.
  // Body-text placement rule (per spec): attached to the FIRST send only.
  // - text only -> sendUserMessage
  // - 2+ images present -> body rides MFM (fired first), other files follow
  // - 1 image only -> body rides that single sendFileMessage
  // - non-images only -> body rides the first sendFileMessage
  const handleSubmit = useCallback(async ({
    message,
    mentionTemplate,
    files,
  }: { message: string; mentionTemplate: string; files: PendingFile[] }) => {
    const trimmed = message.trim();
    const parentMessageId = quoteMessage?.messageId;

    if (files.length === 0) {
      if (trimmed.length === 0) return;
      sendUserMessage({
        message,
        mentionedUsers,
        mentionedMessageTemplate: mentionTemplate,
        parentMessageId,
      });
    } else {
      // Compress images before send (matches legacy useHandleUploadFiles behavior).
      const rawImageFiles = files.filter((entry) => entry.isImage).map((entry) => entry.file);
      const otherFiles = files.filter((entry) => !entry.isImage).map((entry) => entry.file);
      const { compressedFiles: compressedImageFiles } = await compressImages({
        files: rawImageFiles,
        imageCompression,
        logger,
      });

      let bodyConsumed = false;
      const takeBody = (): string | undefined => {
        if (bodyConsumed) return undefined;
        bodyConsumed = true;
        return trimmed.length > 0 ? message : undefined;
      };

      let chain: Promise<unknown> = Promise.resolve();
      // MFM only when feature flag is on AND 2+ images. Otherwise dispatch each
      // image individually so isMultipleFilesMessageEnabled=false is respected
      // even when DnD/paste deliver multiple files.
      const useMFMBatch = isMultipleFilesMessageEnabled && compressedImageFiles.length > 1;
      if (useMFMBatch) {
        chain = Promise.resolve(sendMultipleFilesMessage({
          fileInfoList: compressedImageFiles.map((file) => ({
            file,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          })),
          message: takeBody(),
          parentMessageId,
        }));
      } else if (compressedImageFiles.length === 1) {
        chain = Promise.resolve(sendFileMessage({
          file: compressedImageFiles[0],
          message: takeBody(),
          parentMessageId,
        }));
      } else if (compressedImageFiles.length > 1) {
        compressedImageFiles.forEach((file) => {
          chain = chain.then(() => sendFileMessage({
            file,
            message: takeBody(),
            parentMessageId,
          }));
        });
      }
      otherFiles.forEach((file) => {
        chain = chain.then(() => sendFileMessage({
          file,
          message: takeBody(),
          parentMessageId,
        }));
      });
    }

    setMentionNickname('');
    setMentionedUsers([]);
    setQuoteMessage(null);
    stopTyping();
    clearPendingFiles();
  }, [
    sendUserMessage,
    sendFileMessage,
    sendMultipleFilesMessage,
    mentionedUsers,
    quoteMessage,
    setQuoteMessage,
    currentChannel,
    stopTyping,
    clearPendingFiles,
    isMultipleFilesMessageEnabled,
    imageCompression,
    logger,
  ]);

  if (isBroadcast && !isOperator) {
    /* Only `Operator` can send messages in the Broadcast channel */
    return null;
  }
  // other conditions
  return (
    <div className={showVoiceMessageInput ? 'sendbird-message-input-wrapper--voice-message' : 'sendbird-message-input-wrapper'}>
      {showSuggestedMentionList && (
        <SuggestedMentionList
          currentChannel={currentChannel}
          targetNickname={mentionNickname}
          inputEvent={messageInputEvent ?? undefined}
          renderUserMentionItem={renderUserMentionItem}
          onUserItemClick={(user) => {
            if (user) {
              setMentionedUsers([...mentionedUsers, user]);
            }
            setMentionNickname('');
            setSelectedUser(user);
            setMessageInputEvent(null);
          }}
          onFocusItemChange={() => {
            setMessageInputEvent(null);
          }}
          onFetchUsers={(users) => {
            setMentionSuggestedUsers(users);
          }}
          ableAddMention={ableMention}
          maxMentionCount={maxMentionCount}
          maxSuggestionCount={maxSuggestionCount}
        />
      )}
      {quoteMessage && (
        <div className="sendbird-message-input-wrapper__quote-message-input">
          <QuoteMessageInput replyingMessage={quoteMessage} onClose={() => {
            setQuoteMessage(null);
          }} />
        </div>
      )}
      {showVoiceMessageInput ? (
        <VoiceMessageInputWrapper
          channel={currentChannel ?? undefined}
          onSubmitClick={(recordedFile, duration) => {
            sendVoiceMessage({ file: recordedFile, parentMessageId: quoteMessage?.messageId }, duration);
            setQuoteMessage(null);
            setShowVoiceMessageInput(false);
          }}
          onCancelClick={() => {
            setShowVoiceMessageInput(false);
          }}
        />
      ) : (
        <MessageInput
          className="sendbird-message-input-wrapper__message-input"
          channel={currentChannel}
          channelUrl={currentChannel?.url}
          isMobile={isMobile}
          acceptableMimeTypes={acceptableMimeTypes}
          mentionSelectedUser={selectedUser}
          isMentionEnabled={isMentionEnabled}
          isVoiceMessageEnabled={isVoiceMessageEnabled}
          isSelectingMultipleFilesEnabled={isMultipleFilesMessageEnabled}
          onVoiceMessageIconClick={() => {
            setShowVoiceMessageInput(true);
          }}
          setMentionedUsers={setMentionedUsers}
          placeholder={
            (quoteMessage && stringSet.MESSAGE_INPUT__QUOTE_REPLY__PLACE_HOLDER)
            || (isDisabledBecauseFrozen(currentChannel) && stringSet.MESSAGE_INPUT__PLACE_HOLDER__FROZEN)
            || (isDisabledBecauseMuted(currentChannel)
              && (isMobile
                ? stringSet.MESSAGE_INPUT__PLACE_HOLDER__MUTED_SHORT
                : stringSet.MESSAGE_INPUT__PLACE_HOLDER__MUTED))
            || (isDisabledBecauseSuggestedReplies(currentChannel, config.groupChannel.enableSuggestedReplies)
              && stringSet.MESSAGE_INPUT__PLACE_HOLDER__SUGGESTED_REPLIES)
            || (isDisabledBecauseMessageForm(messages, config.groupChannel.enableFormTypeMessage)
              && stringSet.MESSAGE_INPUT__PLACE_HOLDER__MESSAGE_FORM)
            || (disabled && stringSet.MESSAGE_INPUT__PLACE_HOLDER__DISABLED)
            || undefined
          }
          ref={(ref || messageInputRef) as any}
          disabled={isMessageInputDisabled}
          renderFileUploadIcon={renderFileUploadIcon}
          renderSendMessageIcon={renderSendMessageIcon}
          renderVoiceMessageIcon={renderVoiceMessageIcon}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          pendingFiles={pendingFiles}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
          onUserMentioned={(user) => {
            if (selectedUser?.userId === user?.userId) {
              setSelectedUser(null);
              setMentionNickname('');
            }
          }}
          onMentionStringChange={(mentionText) => {
            setMentionNickname(mentionText);
          }}
          onMentionedUserIdsUpdated={(userIds) => {
            setMentionedUserIds(userIds);
          }}
          onKeyDown={(e) => {
            if (
              showSuggestedMentionList
              && mentionSuggestedUsers?.length > 0
              && ((e.key === MessageInputKeys.Enter && ableMention)
                || e.key === MessageInputKeys.ArrowUp
                || e.key === MessageInputKeys.ArrowDown)
            ) {
              setMessageInputEvent(e);
              return true;
            }
            return false;
          }}
        />
      )}
    </div>
  );
});

export { VoiceMessageInputWrapper, type VoiceMessageInputWrapperProps } from './VoiceMessageInputWrapper';

export default MessageInputWrapperView;
