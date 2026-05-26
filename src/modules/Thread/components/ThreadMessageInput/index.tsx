import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTypingLifecycle } from '../../../../hooks/useTypingLifecycle';
import { MutedState } from '@sendbird/chat/groupChannel';

import './index.scss';

import { useMediaQueryContext } from '../../../../lib/MediaQueryContext';
import { useLocalization } from '../../../../lib/LocalizationContext';
import { useGlobalModalContext } from '../../../../hooks/useModal';

import MessageInput from '../../../../ui/MessageInput';
import type { PendingFile } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { usePendingFiles } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { useDragAndDrop } from '../../../../ui/MessageInput/hooks/useDragAndDrop';
import { checkIfFileUploadEnabled, filterFilesForUpload } from '../../../../ui/MessageInput/messageInputUtils';
import { isChannelTypeSupportsMultipleFilesMessage } from '../../../../ui/MessageInput/utils';
import { MessageInputKeys } from '../../../../ui/MessageInput/const';
import { SuggestedMentionList } from '../SuggestedMentionList';
import { VoiceMessageInputWrapper } from '../../../GroupChannel/components/MessageInputWrapper';
import { Role } from '../../../../lib/Sendbird/types';

import { useDirtyGetMentions } from '../../../Message/hooks/useDirtyGetMentions';
import { isDisabledBecauseFrozen, isDisabledBecauseMuted } from '../../../Channel/context/utils';
import { User } from '@sendbird/chat';
import { classnames } from '../../../../utils/utils';
import useThread from '../../context/useThread';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
import { compressImages } from '../../../../utils/compressImages';

export interface ThreadMessageInputProps {
  className?: string;
  disabled?: boolean;
  renderFileUploadIcon?: () => React.ReactElement;
  renderVoiceMessageIcon?: () => React.ReactElement;
  renderSendMessageIcon?: () => React.ReactElement;
  acceptableMimeTypes?: string[];
}

const ThreadMessageInput = (
  props: ThreadMessageInputProps,
  ref: React.MutableRefObject<any>,
): React.ReactElement => {
  const {
    className,
    renderFileUploadIcon,
    renderVoiceMessageIcon,
    renderSendMessageIcon,
    acceptableMimeTypes,
  } = props;

  const { state: { config } } = useSendbird();
  const { isMobile } = useMediaQueryContext();
  const { stringSet } = useLocalization();
  const { isOnline, userMention, logger, groupChannel, imageCompression } = config;
  const threadContext = useThread();
  const {
    state: {
      currentChannel,
      parentMessage,
      isMuted,
      isChannelFrozen,
      allThreadMessages,
    },
    actions: {
      sendMessage,
      sendFileMessage,
      sendVoiceMessage,
      sendMultipleFilesMessage,
    },
  } = threadContext;
  const messageInputRef = useRef();

  const isMentionEnabled = groupChannel.enableMention;
  const isVoiceMessageEnabled = groupChannel.enableVoiceMessage;
  const isMultipleFilesMessageEnabled = threadContext.state.isMultipleFilesMessageEnabled ?? config.isMultipleFilesMessageEnabled;

  const threadInputDisabled = props.disabled
    || !isOnline
    || isMuted
    || (!(currentChannel?.myRole === Role.OPERATOR) && isChannelFrozen) || parentMessage === null;

  // mention
  const [mentionNickname, setMentionNickname] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User|null>(null);
  const [mentionSuggestedUsers, setMentionSuggestedUsers] = useState<User[]>([]);
  const [messageInputEvent, setMessageInputEvent] = useState<React.KeyboardEvent<HTMLDivElement> | null>(null);
  const [showVoiceMessageInput, setShowVoiceMessageInput] = useState(false);

  // Composer staging
  const { openModal } = useGlobalModalContext();
  const { uikitUploadSizeLimit, uikitMultipleFilesMessageLimit } = config;
  const allowMultipleFiles = Boolean(isMultipleFilesMessageEnabled)
    && Boolean(currentChannel)
    && isChannelTypeSupportsMultipleFilesMessage(currentChannel);
  const effectiveMultiLimit = allowMultipleFiles ? uikitMultipleFilesMessageLimit : 1;
  const {
    pendingFiles,
    addFiles,
    removeFile,
    clear: clearPendingFiles,
  } = usePendingFiles({
    uikitUploadSizeLimit,
    uikitMultipleFilesMessageLimit: effectiveMultiLimit,
    openModal,
    stringSet,
    logger,
  });

  // Window-level drop target — only consume drops that land inside the
  // thread panel (.sendbird-thread-ui). Drops elsewhere are picked up by the
  // main channel composer's hook instance.
  const isFileUploadEnabled = checkIfFileUploadEnabled({ channel: currentChannel ?? undefined, config });
  const handleDroppedFiles = useCallback((dropped: File[]) => {
    const accepted = filterFilesForUpload(dropped, { acceptableMimeTypes });
    if (accepted.length === 0) return;
    addFiles(accepted);
  }, [addFiles, acceptableMimeTypes]);
  useDragAndDrop({
    onAddFiles: handleDroppedFiles,
    disabled: isMobile || threadInputDisabled || showVoiceMessageInput || !isFileUploadEnabled,
    shouldAccept: (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest('.sendbird-thread-ui'));
    },
  });

  const { startTyping, stopTyping } = useTypingLifecycle(currentChannel);

  // Submit handler. Files and body text do not coexist: when files are
  // present, the composer's text is suppressed at the UI level and again
  // here. parentMessage is always the thread parent so each send threads
  // correctly. The caption read path is preserved elsewhere for historical
  // file messages that still carry a body.
  const isSubmittingFilesRef = useRef(false);
  const handleSubmit = useCallback(async ({
    message,
    mentionTemplate,
    files,
  }: { message: string; mentionTemplate: string; files: PendingFile[] }) => {
    const trimmed = message.trim();

    if (files.length === 0) {
      if (trimmed.length === 0) return;
      sendMessage({
        message,
        mentionedUsers,
        mentionTemplate,
        quoteMessage: parentMessage,
      });
      setMentionNickname('');
      setMentionedUsers([]);
      stopTyping();
      return;
    }

    if (isSubmittingFilesRef.current) return;
    isSubmittingFilesRef.current = true;

    setMentionNickname('');
    setMentionedUsers([]);
    stopTyping();
    clearPendingFiles();

    try {
      const rawImageFiles = files.filter((entry) => entry.isImage).map((entry) => entry.file);
      const otherFiles = files.filter((entry) => !entry.isImage).map((entry) => entry.file);
      const { compressedFiles: compressedImageFiles } = await compressImages({
        files: rawImageFiles,
        imageCompression,
        logger,
      });

      const tasks: Array<() => Promise<unknown>> = [];
      const useMFMBatch = isMultipleFilesMessageEnabled && compressedImageFiles.length > 1;
      if (useMFMBatch) {
        tasks.push(() => sendMultipleFilesMessage(
          compressedImageFiles,
          parentMessage ?? undefined,
        ));
      } else if (compressedImageFiles.length === 1) {
        tasks.push(() => sendFileMessage(compressedImageFiles[0], parentMessage ?? undefined));
      } else if (compressedImageFiles.length > 1) {
        compressedImageFiles.forEach((file) => {
          tasks.push(() => sendFileMessage(file, parentMessage ?? undefined));
        });
      }
      otherFiles.forEach((file) => {
        tasks.push(() => sendFileMessage(file, parentMessage ?? undefined));
      });

      // Sequential dispatch with per-task error isolation.
      (async () => {
        for (const task of tasks) {
          try {
            await task();
          } catch (error) {
            logger.warning?.('Thread|composer: file send failed', error);
          }
        }
      })();
    } finally {
      isSubmittingFilesRef.current = false;
    }
  }, [
    sendMessage,
    sendFileMessage,
    sendMultipleFilesMessage,
    mentionedUsers,
    parentMessage,
    currentChannel,
    stopTyping,
    clearPendingFiles,
    isMultipleFilesMessageEnabled,
    imageCompression,
    logger,
  ]);
  const displaySuggestedMentionList = isOnline
    && isMentionEnabled
    && mentionNickname.length > 0
    && !isDisabledBecauseFrozen(currentChannel)
    && !isDisabledBecauseMuted(currentChannel)
    && !currentChannel?.isBroadcast;

  const stashedMentionedUsersRef = useRef<User[] | null>(null);
  const prevHasPendingFilesRef = useRef<boolean>(false);
  const hasPendingFilesInWrapper = pendingFiles.length > 0;
  useEffect(() => {
    if (hasPendingFilesInWrapper && !prevHasPendingFilesRef.current) {
      if (mentionedUsers.length > 0) {
        stashedMentionedUsersRef.current = mentionedUsers;
      }
    } else if (!hasPendingFilesInWrapper && prevHasPendingFilesRef.current) {
      if (stashedMentionedUsersRef.current) {
        setMentionedUsers(stashedMentionedUsersRef.current);
        stashedMentionedUsersRef.current = null;
      }
    }
    prevHasPendingFilesRef.current = hasPendingFilesInWrapper;
  }, [hasPendingFilesInWrapper]);

  // Reset when changing channel
  useEffect(() => {
    setShowVoiceMessageInput(false);
    clearPendingFiles();
    stashedMentionedUsersRef.current = null;
  }, [currentChannel?.url]);

  const mentionNodes = useDirtyGetMentions({ ref: ref || messageInputRef }, { logger });
  const ableMention = mentionNodes?.length < userMention?.maxMentionCount;

  useEffect(() => {
    setMentionedUsers(mentionedUsers.filter(({ userId }) => {
      const i = mentionedUserIds.indexOf(userId);
      if (i < 0) {
        return false;
      } else {
        mentionedUserIds.splice(i, 1);
        return true;
      }
    }));
  }, [mentionedUserIds]);

  if (currentChannel?.isBroadcast && currentChannel?.myRole !== Role.OPERATOR) {
    return <></>;
  }

  return (
    <div className={classnames(showVoiceMessageInput ? 'sendbird-thread-message-input--voice-message' : 'sendbird-thread-message-input', className)}>
      {
        displaySuggestedMentionList && (
          <SuggestedMentionList
            targetNickname={mentionNickname}
            inputEvent={messageInputEvent ?? undefined}
            // renderUserMentionItem={renderUserMentionItem}
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
            maxMentionCount={userMention?.maxMentionCount}
            maxSuggestionCount={userMention?.maxSuggestionCount}
          />
        )
      }
      {
        showVoiceMessageInput
          ? (
            <VoiceMessageInputWrapper
              channel={currentChannel}
              onSubmitClick={(recordedFile, duration) => {
                sendVoiceMessage(recordedFile, duration, parentMessage);
                setShowVoiceMessageInput(false);
              }}
              onCancelClick={() => {
                setShowVoiceMessageInput(false);
              }}
            />
          )
          : (
            <MessageInput
              className="sendbird-thread-message-input__message-input"
              messageFieldId="sendbird-message-input-text-field--thread"
              channel={currentChannel}
              channelUrl={currentChannel?.url}
              isMobile={isMobile}
              disabled={threadInputDisabled}
              acceptableMimeTypes={acceptableMimeTypes}
              setMentionedUsers={setMentionedUsers}
              mentionSelectedUser={selectedUser}
              isMentionEnabled={isMentionEnabled}
              isVoiceMessageEnabled={isVoiceMessageEnabled}
              isSelectingMultipleFilesEnabled={isMultipleFilesMessageEnabled}
              onVoiceMessageIconClick={() => {
                setShowVoiceMessageInput(true);
              }}
              renderFileUploadIcon={renderFileUploadIcon}
              renderVoiceMessageIcon={renderVoiceMessageIcon}
              renderSendMessageIcon={renderSendMessageIcon}
              ref={ref || messageInputRef}
              placeholder={
                (currentChannel?.isFrozen && !(currentChannel?.myRole === Role.OPERATOR) && stringSet.MESSAGE_INPUT__PLACE_HOLDER__DISABLED)
                || (currentChannel?.myMutedState === MutedState.MUTED && stringSet.MESSAGE_INPUT__PLACE_HOLDER__MUTED_SHORT)
                || (allThreadMessages.length > 0
                  ? stringSet.THREAD__INPUT__REPLY_TO_THREAD
                  : stringSet.THREAD__INPUT__REPLY_IN_THREAD
                )
              }
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
                if (displaySuggestedMentionList && mentionSuggestedUsers?.length > 0
                  && ((e.key === MessageInputKeys.Enter && ableMention) || e.key === MessageInputKeys.ArrowUp || e.key === MessageInputKeys.ArrowDown)
                ) {
                  setMessageInputEvent(e);
                  return true;
                }
                return false;
              }}
            />
          )
      }
    </div>
  );
};

export default React.forwardRef(ThreadMessageInput);
