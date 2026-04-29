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
  const { isOnline, userMention, logger, groupChannel } = config;
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

  const { startTyping, stopTyping } = useTypingLifecycle(currentChannel);

  // Submit handler. Body-text rule mirrors GroupChannel: text rides the
  // FIRST send only. parentMessage is always the thread parent, so each send
  // automatically threads correctly.
  const handleSubmit = useCallback(({
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
    } else {
      const imageEntries = files.filter((entry) => entry.isImage);
      const otherEntries = files.filter((entry) => !entry.isImage);

      let bodyConsumed = false;
      const takeBody = (): { message?: string } => {
        if (bodyConsumed || trimmed.length === 0) return {};
        bodyConsumed = true;
        return { message };
      };

      let chain: Promise<unknown> = Promise.resolve();
      if (imageEntries.length === 1) {
        chain = Promise.resolve(sendFileMessage(imageEntries[0].file, parentMessage ?? undefined, takeBody()));
      } else if (imageEntries.length > 1) {
        chain = Promise.resolve(sendMultipleFilesMessage(
          imageEntries.map(({ file }) => file),
          parentMessage ?? undefined,
          takeBody(),
        ));
      }
      otherEntries.forEach((entry) => {
        chain = chain.then(() => sendFileMessage(entry.file, parentMessage ?? undefined, takeBody()));
      });
    }

    setMentionNickname('');
    setMentionedUsers([]);
    stopTyping();
    clearPendingFiles();
  }, [
    sendMessage,
    sendFileMessage,
    sendMultipleFilesMessage,
    mentionedUsers,
    parentMessage,
    currentChannel,
    stopTyping,
    clearPendingFiles,
  ]);
  const displaySuggestedMentionList = isOnline
    && isMentionEnabled
    && mentionNickname.length > 0
    && !isDisabledBecauseFrozen(currentChannel)
    && !isDisabledBecauseMuted(currentChannel)
    && !currentChannel?.isBroadcast;

  // Reset when changing channel
  useEffect(() => {
    setShowVoiceMessageInput(false);
    clearPendingFiles();
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
