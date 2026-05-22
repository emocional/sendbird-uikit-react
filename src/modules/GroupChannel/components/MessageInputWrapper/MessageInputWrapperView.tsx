import './index.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useDragAndDrop } from '../../../../ui/MessageInput/hooks/useDragAndDrop';
import { checkIfFileUploadEnabled, filterFilesForUpload } from '../../../../ui/MessageInput/messageInputUtils';
import { isChannelTypeSupportsMultipleFilesMessage } from '../../../../ui/MessageInput/utils';
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

  // Window-level drop target — files dropped anywhere in the viewport route
  // into this channel's composer EXCEPT when the drop lands inside an open
  // thread panel, which has its own composer. Disabled on mobile and when
  // the input itself is not accepting new files (voice recording, channel
  // disabled).
  const isFileUploadEnabled = checkIfFileUploadEnabled({ channel: currentChannel ?? undefined, config });
  const allowMultipleFiles = Boolean(isMultipleFilesMessageEnabled)
    && Boolean(currentChannel)
    && isChannelTypeSupportsMultipleFilesMessage(currentChannel as GroupChannel);
  const handleDroppedFiles = useCallback((dropped: File[]) => {
    const accepted = filterFilesForUpload(dropped, { acceptableMimeTypes, allowMultipleFiles });
    if (accepted.length === 0) return;
    addFiles(accepted);
  }, [addFiles, acceptableMimeTypes, allowMultipleFiles]);
  useDragAndDrop({
    onAddFiles: handleDroppedFiles,
    disabled: isMobile || isMessageInputDisabled || showVoiceMessageInput || !isFileUploadEnabled,
    shouldAccept: (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return true;
      return !target.closest('.sendbird-thread-ui');
    },
  });

  const stashedMentionedUsersRef = useRef<User[] | null>(null);
  const stashedQuoteMessageRef = useRef<SendableMessageType | null>(null);
  const prevHasPendingFilesRef = useRef<boolean>(false);
  const hasPendingFilesInWrapper = pendingFiles.length > 0;
  useEffect(() => {
    if (hasPendingFilesInWrapper && !prevHasPendingFilesRef.current) {
      if (mentionedUsers.length > 0) {
        stashedMentionedUsersRef.current = mentionedUsers;
      }
      if (quoteMessage) {
        stashedQuoteMessageRef.current = quoteMessage;
      }
    } else if (!hasPendingFilesInWrapper && prevHasPendingFilesRef.current) {
      if (stashedMentionedUsersRef.current) {
        setMentionedUsers(stashedMentionedUsersRef.current);
        stashedMentionedUsersRef.current = null;
      }
      if (stashedQuoteMessageRef.current) {
        setQuoteMessage(stashedQuoteMessageRef.current);
        stashedQuoteMessageRef.current = null;
      }
    }
    prevHasPendingFilesRef.current = hasPendingFilesInWrapper;
  }, [hasPendingFilesInWrapper]);

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
    stashedMentionedUsersRef.current = null;
    stashedQuoteMessageRef.current = null;
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

  const isSubmittingFilesRef = useRef(false);

  // Submit handler: drains pendingFiles XOR text body. Files and body do not
  // coexist in a single send anymore — when files are present, text from the
  // composer is suppressed at the UI level (textarea locked) and again here
  // for defense in depth. The caption read path remains in MessageBody to
  // render historical file messages that still carry a body.
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
      setMentionNickname('');
      setMentionedUsers([]);
      setQuoteMessage(null);
      stopTyping();
      return;
    }

    if (isSubmittingFilesRef.current) return;
    isSubmittingFilesRef.current = true;

    // Clear pending state and other composer state immediately so a rapid
    // second send (within the compression window) finds an empty queue and
    // bails out at MessageInput's sendMessage gate.
    setMentionNickname('');
    setMentionedUsers([]);
    setQuoteMessage(null);
    stashedQuoteMessageRef.current = null;
    stopTyping();
    clearPendingFiles();

    try {
      // Compress images before send (matches legacy useHandleUploadFiles behavior).
      const rawImageFiles = files.filter((entry) => entry.isImage).map((entry) => entry.file);
      const otherFiles = files.filter((entry) => !entry.isImage).map((entry) => entry.file);
      const { compressedFiles: compressedImageFiles } = await compressImages({
        files: rawImageFiles,
        imageCompression,
        logger,
      });

      // Sequential dispatcher built upfront so per-step error isolation does
      // not affect ordering. No body / mention metadata is attached to any
      // file send — text is intentionally dropped when files are present.
      const tasks: Array<() => Promise<unknown>> = [];
      const useMFMBatch = isMultipleFilesMessageEnabled && compressedImageFiles.length > 1;
      if (useMFMBatch) {
        tasks.push(() => sendMultipleFilesMessage({
          fileInfoList: compressedImageFiles.map((file) => ({
            file,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          })),
          parentMessageId,
        } as MultipleFilesMessageCreateParams));
      } else if (compressedImageFiles.length === 1) {
        const file = compressedImageFiles[0];
        tasks.push(() => sendFileMessage({
          file,
          parentMessageId,
        } as FileMessageCreateParams));
      } else if (compressedImageFiles.length > 1) {
        compressedImageFiles.forEach((file) => {
          tasks.push(() => sendFileMessage({
            file,
            parentMessageId,
          } as FileMessageCreateParams));
        });
      }
      otherFiles.forEach((file) => {
        tasks.push(() => sendFileMessage({
          file,
          parentMessageId,
        } as FileMessageCreateParams));
      });

      // Sequential dispatch with per-task error isolation: one failure must not
      // break the rest of the batch. Fire-and-forget so UI cleanup runs now.
      (async () => {
        for (const task of tasks) {
          try {
            await task();
          } catch (error) {
            logger.warning?.('GroupChannel|composer: file send failed', error);
          }
        }
      })();
    } finally {
      isSubmittingFilesRef.current = false;
    }
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
            stashedQuoteMessageRef.current = null;
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
