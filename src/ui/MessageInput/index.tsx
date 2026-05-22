import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';
import { MessageInputKeys, NodeTypes } from './const';

import { USER_MENTION_TEMP_CHAR } from '../../modules/Channel/context/const';
import IconButton from '../IconButton';
import Button, { ButtonSizes, ButtonTypes } from '../Button';
import renderMentionLabelToString from '../MentionUserLabel/renderToString';
import Icon, { IconColors, IconTypes } from '../Icon';
import Label, { LabelColors, LabelTypography } from '../Label';
import { useLocalization } from '../../lib/LocalizationContext';

import {
  extractTextAndMentions,
  isChannelTypeSupportsMultipleFilesMessage,
  nodeListToArray,
  sanitizeString,
  stripZeroWidthSpace,
} from './utils';
import { arrayEqual, getMimeTypesUIKitAccepts } from '../../utils';
import { usePaste } from './hooks/usePaste';
import type { PendingFile } from './hooks/usePendingFiles';
import PendingFilesPreview from './composer/PendingFilesPreview';
import { tokenizeMessage } from '../../modules/Message/utils/tokens/tokenize';
import { USER_MENTION_PREFIX } from '../../modules/Message/consts';
import { TOKEN_TYPES } from '../../modules/Message/utils/tokens/types';
import { checkIfFileUploadEnabled } from './messageInputUtils';
import { classnames } from '../../utils/utils';
import { isMobileIOS } from '../../utils/browser';

import { GroupChannel } from '@sendbird/chat/groupChannel';
import { User } from '@sendbird/chat';
import { OpenChannel } from '@sendbird/chat/openChannel';
import { UserMessage } from '@sendbird/chat/message';
import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';

const TEXT_FIELD_ID = 'sendbird-message-input-text-field';
const noop = () => {
  return null;
};

const resetInput = (ref: MutableRefObject<HTMLInputElement | null> | null) => {
  if (ref && ref.current) {
    ref.current.innerHTML = '';
  }
};

const getTextContentWithoutZeroWidthSpace = (node?: { textContent?: string | null } | null) => {
  return stripZeroWidthSpace(node?.textContent ?? '');
};

const hasTextContentWithoutZeroWidthSpace = (node?: { textContent?: string | null } | null) => {
  return getTextContentWithoutZeroWidthSpace(node).trim().length > 0;
};

interface TargetStringInfo {
  targetString: string;
  startNodeIndex: number | null;
  startOffsetIndex: number | null;
  endNodeIndex: number | null;
  endOffsetIndex: number | null;
}

const initialTargetStringInfo: TargetStringInfo = {
  targetString: '',
  startNodeIndex: null,
  startOffsetIndex: null,
  endNodeIndex: null,
  endOffsetIndex: null,
};

type MessageInputProps = {
  channel: GroupChannel | OpenChannel;
  message?: UserMessage;
  value?: null | string;
  className?: string | string[];
  messageFieldId?: string;
  isEdit?: boolean;
  isMobile?: boolean;
  isMentionEnabled?: boolean;
  isVoiceMessageEnabled?: boolean;
  isSelectingMultipleFilesEnabled?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  /**
   * @deprecated Pass `onAddFiles` + `onSubmit` for the composer flow. When
   * `onAddFiles` is undefined, files from the picker are routed here for
   * immediate send (legacy behavior).
   */
  onFileUpload?: (file: File[]) => void;
  onSendMessage?: (params: { message: string; mentionTemplate: string }) => void;
  /**
   * Composer mode: files staged for send. When defined and non-empty, the
   * preview strip renders above the textarea and the send button activates
   * regardless of text input state.
   */
  pendingFiles?: PendingFile[];
  /**
   * Composer mode: routes files from the picker, drag-drop, and clipboard
   * paste to the staging hook. When defined, takes precedence over
   * `onFileUpload`.
   */
  onAddFiles?: (files: File[]) => void;
  /**
   * Composer mode: removes a staged file by id from the preview strip.
   */
  onRemoveFile?: (id: string) => void;
  /**
   * Composer mode: unified send action. When defined, takes precedence over
   * `onSendMessage` for the click and Enter-key paths.
   */
  onSubmit?: (params: { message: string; mentionTemplate: string; files: PendingFile[] }) => void;
  onUpdateMessage?: (params: { messageId: number; message: string; mentionTemplate: string; mentionedUserIds?: string[] }) => void;
  onCancelEdit?: () => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
  channelUrl?: string;
  mentionSelectedUser?: null | User;
  onUserMentioned?: (user: User) => void;
  onMentionStringChange?: (mentionString: string) => void;
  onMentionedUserIdsUpdated?: (mentionedUserIds: string[]) => void;
  onVoiceMessageIconClick?: () => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
  renderVoiceMessageIcon?: () => React.ReactNode;
  renderFileUploadIcon?: () => React.ReactNode;
  renderSendMessageIcon?: () => React.ReactNode;
  setMentionedUsers?: React.Dispatch<React.SetStateAction<User[]>>;
  acceptableMimeTypes?: string[];
};
const MessageInput = React.forwardRef<HTMLInputElement, MessageInputProps>((props, externalRef) => {
  const {
    channel,
    className = '',
    messageFieldId = '',
    isEdit = false,
    isMobile = false,
    isMentionEnabled = false,
    isVoiceMessageEnabled = true,
    isSelectingMultipleFilesEnabled = false,
    disabled = false,
    message = null,
    placeholder = '',
    maxLength = 5000,
    onFileUpload = noop,
    onSendMessage = noop,
    onUpdateMessage = noop,
    onCancelEdit = noop,
    onStartTyping = noop,
    onStopTyping = noop,
    channelUrl = '',
    mentionSelectedUser = null,
    onUserMentioned = noop,
    onMentionStringChange = noop,
    onMentionedUserIdsUpdated = noop,
    onVoiceMessageIconClick = noop,
    onKeyUp = noop,
    onKeyDown = noop,
    renderFileUploadIcon = noop,
    renderVoiceMessageIcon = noop,
    renderSendMessageIcon = noop,
    setMentionedUsers = noop,
    acceptableMimeTypes,
    pendingFiles,
    onAddFiles,
    onRemoveFile,
    onSubmit,
  } = props;
  const isComposerMode = typeof onAddFiles === 'function';
  const hasPendingFiles = (pendingFiles?.length ?? 0) > 0;

  const internalRef = (externalRef && 'current' in externalRef) ? externalRef : useRef(null);
  const ghostInputRef = useRef<HTMLInputElement>(null);
  const wasTypingRef = useRef(false);

  const textFieldId = messageFieldId || TEXT_FIELD_ID;
  const { stringSet } = useLocalization();
  const { state: { config, eventHandlers } } = useSendbird();

  const isFileUploadEnabled = checkIfFileUploadEnabled({
    channel,
    config,
  });

  // Gate paste/DnD/picker on the same enableDocument flag that hides the
  // attach icon — otherwise feature-flag-disabled environments leak files in.
  // Also gate on !isEdit: today no edit-mode caller passes composer props, but
  // if one did, staged files would have nowhere to go (Send is replaced by
  // Cancel/Save). Belt-and-suspenders.
  const fileProducerEnabled = isComposerMode && isFileUploadEnabled && !disabled && !isEdit;
  const guardedAddFiles = useCallback((incoming: File[]) => {
    if (!fileProducerEnabled || !onAddFiles) return;
    if (incoming.length === 0) return;
    onAddFiles(incoming);
  }, [fileProducerEnabled, onAddFiles]);

  const fileInputRef = useRef<HTMLInputElement>();
  const [isInput, setIsInput] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [targetStringInfo, setTargetStringInfo] = useState({ ...initialTargetStringInfo });

  // #Edit mode
  // for easily initialize input value from outside, but
  // useEffect(_, [channelUrl]) erase it
  const initialValue = props?.value;
  useEffect(() => {
    const textField = internalRef?.current;
    setMentionedUserIds([]);
    setIsInput(hasTextContentWithoutZeroWidthSpace(textField));
  }, [initialValue]);

  const stashedHtmlRef = useRef<string>('');
  const prevHasPendingFilesRef = useRef<boolean>(false);

  // #Mention | Clear input value when channel changes
  useEffect(() => {
    if (!isEdit) {
      setIsInput(false);
      resetInput(internalRef);
      wasTypingRef.current = false;
      stashedHtmlRef.current = '';
    }
  }, [channelUrl]);

  useEffect(() => {
    const textField = internalRef?.current;
    if (!textField) {
      prevHasPendingFilesRef.current = hasPendingFiles;
      return;
    }
    if (hasPendingFiles && !prevHasPendingFilesRef.current) {
      if (hasTextContentWithoutZeroWidthSpace(textField)) {
        stashedHtmlRef.current = textField.innerHTML;
        resetInput(internalRef);
        setIsInput(false);
      }
    } else if (!hasPendingFiles && prevHasPendingFilesRef.current) {
      if (stashedHtmlRef.current) {
        textField.innerHTML = stashedHtmlRef.current;
        stashedHtmlRef.current = '';
        setIsInput(true);
      }
    }
    prevHasPendingFilesRef.current = hasPendingFiles;
  }, [hasPendingFiles]);

  // #Mention & #Edit | Fill message input values
  useEffect(() => {
    if (isEdit && message?.messageId) {
      // const textField = document.getElementById(textFieldId);
      const textField = internalRef?.current;
      if (isMentionEnabled
        && message?.mentionedUsers
        && message.mentionedUsers.length > 0
        && message?.mentionedMessageTemplate
        && message.mentionedMessageTemplate.length > 0) {
        /* mention enabled */
        const { mentionedUsers = [] } = message;
        const tokens = tokenizeMessage({
          messageText: message?.mentionedMessageTemplate,
          mentionedUsers,
          includeMarkdown: channel.isGroupChannel() && config.groupChannel.enableMarkdownForUserMessage,
        });
        if (textField) {
          textField.innerHTML = tokens
            .map((token) => {
              if (token.type === TOKEN_TYPES.mention) {
                const mentionedUser = mentionedUsers.find((user) => user.userId === token.userId);
                const nickname = `${USER_MENTION_PREFIX}${mentionedUser?.nickname || token.value || stringSet.MENTION_NAME__NO_NAME}`;
                return renderMentionLabelToString({
                  userId: token.userId,
                  nickname,
                });
              }
              return sanitizeString(token.value);
            })
            .join('');
        }
      } else {
        /* mention disabled */
        try {
          if (textField) {
            textField.innerHTML = sanitizeString(message?.message) ?? '';
          }
        } catch {
          //
        }
        setMentionedUserIds([]);
      }
      setIsInput(hasTextContentWithoutZeroWidthSpace(textField));
    }
  }, [isEdit, message]);

  // #Mention | Detect MentionedLabel modified
  const useMentionedLabelDetection = useCallback(() => {
    const textField = internalRef?.current;
    if (isMentionEnabled && textField) {
      const newMentionedUserIds = Array.from(textField.getElementsByClassName('sendbird-mention-user-label')).map(
        // @ts-ignore
        (node) => node?.dataset?.userid,
      );
      if (!arrayEqual(mentionedUserIds, newMentionedUserIds) || newMentionedUserIds.length === 0) {
        onMentionedUserIdsUpdated(newMentionedUserIds);
        setMentionedUserIds(newMentionedUserIds);
      }
    }
    setIsInput(hasTextContentWithoutZeroWidthSpace(textField));
  }, [targetStringInfo, isMentionEnabled]);

  // #Mention | Replace selected user nickname to the MentionedUserLabel
  useEffect(() => {
    if (isMentionEnabled && mentionSelectedUser) {
      const { targetString, startNodeIndex, startOffsetIndex, endNodeIndex, endOffsetIndex } = targetStringInfo;
      const textField = internalRef?.current;
      if (targetString && startNodeIndex !== null && startOffsetIndex !== null && endOffsetIndex !== null && endNodeIndex !== null && textField) {
        // const textField = document.getElementById(textFieldId);
        const childNodes = nodeListToArray(textField?.childNodes);
        const startNodeTextContent: string = childNodes[startNodeIndex]?.textContent ?? '';
        const frontTextNode = document.createTextNode(
          startNodeTextContent.slice(0, startOffsetIndex),
        );
        const endNodeTextContent: string = childNodes[endNodeIndex]?.textContent ?? '';
        const backTextNode = endOffsetIndex && document.createTextNode(
          `\u00A0${endNodeTextContent.slice(endOffsetIndex)}`,
        );
        const mentionLabel = renderMentionLabelToString({
          userId: mentionSelectedUser?.userId,
          nickname: `${USER_MENTION_TEMP_CHAR}${mentionSelectedUser?.nickname || stringSet.MENTION_NAME__NO_NAME}`,
        });
        const div = document.createElement('div');
        div.innerHTML = mentionLabel;
        const newNodes = [
          ...childNodes.slice(0, startNodeIndex),
          frontTextNode,
          div.childNodes[0],
          backTextNode,
          ...childNodes.slice(endNodeIndex + 1),
        ];
        if (textField) {
          textField.innerHTML = '';
          newNodes.forEach((newNode) => {
            if (newNode) {
              textField.appendChild(newNode);
            }
          });
        }
        onUserMentioned(mentionSelectedUser);
        if (window.getSelection || document.getSelection) {
          // set caret postion
          const selection = window.getSelection() || document.getSelection();
          selection?.removeAllRanges();
          const range = new Range();
          range.selectNodeContents(textField);
          range.setStart(textField.childNodes[startNodeIndex + 2], 1);
          range.setEnd(textField.childNodes[startNodeIndex + 2], 1);
          range.collapse(false);
          selection?.addRange(range);
          textField.focus();
        }
        setTargetStringInfo({ ...initialTargetStringInfo });
        useMentionedLabelDetection();
      }
    }
  }, [mentionSelectedUser, isMentionEnabled]);

  // #Mention | Detect mentioning user nickname
  const useMentionInputDetection = useCallback(() => {
    const selection = window?.getSelection?.() || document?.getSelection?.();
    const textField = internalRef?.current;
    if (selection?.anchorNode === textField) {
      onMentionStringChange('');
    }
    if (
      isMentionEnabled
      && textField
      && selection
      && selection.anchorNode === selection.focusNode
      && selection.anchorOffset === selection.focusOffset
    ) {
      let textStack = '';
      let startNodeIndex: number | null = null;
      let startOffsetIndex: number | null = null;
      for (let index = 0; index < textField.childNodes.length; index += 1) {
        const currentNode = textField.childNodes[index];
        if (currentNode.nodeType === NodeTypes.TextNode) {
          /* text node */
          const textContent: string = ((): string => {
            if (currentNode === selection.anchorNode) {
              return currentNode?.textContent ? currentNode?.textContent.slice(0, selection.anchorOffset) : '';
            }
            return currentNode?.textContent ?? '';
          })();
          if (textStack.length > 0) {
            textStack += textContent;
          } else {
            let charLastIndex = textContent.lastIndexOf(USER_MENTION_TEMP_CHAR);
            for (let i = charLastIndex - 1; i > -1; i -= 1) {
              if (textContent[i] === USER_MENTION_TEMP_CHAR) {
                charLastIndex = i;
              } else {
                break;
              }
            }
            if (charLastIndex > -1) {
              textStack = textContent;
              startNodeIndex = index;
              startOffsetIndex = charLastIndex;
            }
          }
        } else {
          /* other nodes */
          textStack = '';
          startNodeIndex = null;
          startOffsetIndex = null;
        }
        if (currentNode === selection.anchorNode) {
          /**
           * targetString could be ''
           * startNodeIndex and startOffsetIndex could be null
           */
          const targetString = textStack && startOffsetIndex !== null ? textStack.slice(startOffsetIndex) : ''; // include template character
          setTargetStringInfo({
            targetString,
            startNodeIndex,
            startOffsetIndex,
            endNodeIndex: index,
            endOffsetIndex: selection.anchorOffset,
          });
          onMentionStringChange(targetString);
          return;
        }
      }
    }
  }, [isMentionEnabled]);

  const sendMessage = () => {
    try {
      const textField = internalRef?.current;
      if (!isEdit && textField) {
        const { messageText, mentionTemplate, isMentionedMessage } = extractTextAndMentions(textField.childNodes);
        const trimmedText = messageText.trim();
        // Composer mode: empty text is OK if files are staged.
        if (trimmedText.length === 0 && !hasPendingFiles) return;
        const params = {
          message: messageText,
          mentionTemplate: isMentionedMessage ? sanitizeString(mentionTemplate) : '',
        };
        if (isComposerMode && onSubmit) {
          onSubmit({ ...params, files: pendingFiles ?? [] });
        } else {
          onSendMessage(params);
        }
        resetInput(internalRef);
        wasTypingRef.current = false;
        /**
         * Note: contentEditable does not work as expected in mobile WebKit (Safari).
         * @see https://github.com/sendbird/sendbird-uikit-react/pull/1108
         */
        if (isMobileIOS(navigator.userAgent)) {
          if (ghostInputRef.current) ghostInputRef.current.focus();
          requestAnimationFrame(() => textField.focus());
        } else {
          // important: keeps the keyboard open -> must add test on refactor
          textField.focus();
        }

        setIsInput(false);
      }
    } catch (error) {
      eventHandlers?.message?.onSendMessageFailed?.(message, error);
    }
  };
  const isEditDisabled = !hasTextContentWithoutZeroWidthSpace(internalRef?.current);
  const editMessage = () => {
    try {
      const textField = internalRef?.current;
      const messageId = message?.messageId;
      if (isEdit && messageId && textField) {
        const { messageText, mentionTemplate, isMentionedMessage, mentionedUserIds } = extractTextAndMentions(textField.childNodes);
        if (messageText.trim().length === 0) return;
        const params = {
          messageId,
          message: messageText,
          mentionTemplate: sanitizeString(isMentionedMessage ? mentionTemplate : messageText),
          mentionedUserIds: isMentionEnabled ? mentionedUserIds : [],
        };
        onUpdateMessage(params);
        resetInput(internalRef);
        wasTypingRef.current = false;
      }
    } catch (error) {
      eventHandlers?.message?.onUpdateMessageFailed?.(message, error);
    }
  };
  const onPaste = usePaste({
    ref: internalRef,
    setMentionedUsers,
    channel,
    setIsInput,
    onAddFiles: fileProducerEnabled && !isMobile ? guardedAddFiles : undefined,
  });

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.currentTarget;
    try {
      if (files) {
        const fileArray = Array.from(files);
        if (fileProducerEnabled) {
          guardedAddFiles(fileArray);
        } else if (!isComposerMode) {
          onFileUpload(fileArray);
        }
      }
    } catch (error) {
      eventHandlers?.message?.onFileUploadFailed?.(error);
    } finally {
      event.target.value = '';
    }
  };

  const adjustScrollToCaret = () => {
    const inputRef = internalRef;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Get the last range (caret or selected text position) from the selection
    const range = selection.getRangeAt(selection.rangeCount - 1);
    const rect = range.getBoundingClientRect();
    const container = inputRef.current?.getBoundingClientRect();
    if (!container || !inputRef.current) return;

    // If the caret (or selection) is below the visible container area, scroll down
    if (rect.bottom > container.bottom) {
      const scrollAmount = Math.min(
        rect.bottom - container.bottom, // Calculate how much we need to scroll
        inputRef.current.scrollHeight - inputRef.current.clientHeight, // Prevent over-scrolling
      );
      inputRef.current.scrollTop += scrollAmount; // Adjust the scroll position downward
    }
    // If the caret (or selection) is above the visible container area, scroll up
    else if (rect.top < container.top) {
      const scrollAmount = Math.min(
        container.top - rect.top, // Calculate how much we need to scroll
        inputRef.current.scrollTop, // Prevent scrolling beyond the top of the container
      );
      inputRef.current.scrollTop -= scrollAmount; // Adjust the scroll position upward
    }
  };

  return (
    <form
      className={classnames(
        ...(Array.isArray(className) ? className : [className]),
        isEdit && 'sendbird-message-input__edit',
        disabled && 'sendbird-message-input-form__disabled',
        isComposerMode && 'sendbird-message-input--composer',
      )}
    >
      <div
        className={classnames(
          'sendbird-message-input',
          disabled && 'sendbird-message-input__disabled',
          hasPendingFiles && 'sendbird-message-input--has-pending',
        )}
        data-testid="sendbird-message-input"
      >
        {isMobileIOS(navigator.userAgent) && (
          <input
            id={'ghost-input-reset-ime-cjk'}
            ref={ghostInputRef}
            style={{ opacity: 0, padding: 0, margin: 0, height: 0, border: 'none', position: 'absolute', top: -9999 }}
            defaultValue={'_'}
          />
        )}
        <div
          id={`${textFieldId}${isEdit ? message?.messageId : ''}`}
          className={classnames(
            'sendbird-message-input--textarea',
            textFieldId,
            hasPendingFiles && 'sendbird-message-input--textarea-locked',
          )}
          contentEditable={!disabled && !hasPendingFiles}
          role="textbox"
          aria-label="Text Input"
          aria-disabled={disabled || hasPendingFiles}
          ref={internalRef}
          // @ts-ignore
          disabled={disabled}
          maxLength={maxLength}
          onKeyDown={(e) => {
            const preventEvent = onKeyDown(e);
            if (preventEvent) {
              e.preventDefault();
            } else {
              if (
                !e.shiftKey
                && e.key === MessageInputKeys.Enter
                && !isMobile
                && (hasTextContentWithoutZeroWidthSpace(internalRef?.current) || hasPendingFiles)
                && e?.nativeEvent?.isComposing !== true
                /**
                 * NOTE: What isComposing does?
                 * Check if the user has finished composing characters
                 * (e.g., for languages like Korean, Japanese, where characters are composed from multiple keystrokes)
                 * Prevents executing the code while the user is still composing characters.
                 */
              ) {
                e.preventDefault();
                sendMessage();
              }
              if (
                e.key === MessageInputKeys.Backspace
                && internalRef?.current?.childNodes?.length === 2
                && !internalRef.current.childNodes[0].textContent
                && internalRef.current.childNodes[1].nodeType === NodeTypes.ElementNode
              ) {
                internalRef.current.removeChild(internalRef.current.childNodes[1]);
              }
            }
          }}
          onKeyUp={(e) => {
            const preventEvent = onKeyUp(e);
            if (preventEvent) {
              e.preventDefault();
            } else {
              useMentionInputDetection();
            }
          }}
          onClick={() => {
            useMentionInputDetection();
          }}
          onInput={() => {
            const hasContent = hasTextContentWithoutZeroWidthSpace(internalRef?.current);
            if (hasContent) {
              onStartTyping();
              wasTypingRef.current = true;
            } else if (wasTypingRef.current) {
              onStopTyping();
              wasTypingRef.current = false;
            }
            setIsInput(hasContent);
            useMentionedLabelDetection();
          }}
          onPaste={(e) => {
            onPaste(e);
            setTimeout(adjustScrollToCaret);
          }}
        />
        {!isEdit && isComposerMode && hasPendingFiles && pendingFiles && onRemoveFile && (
          <PendingFilesPreview pendingFiles={pendingFiles} onRemove={onRemoveFile} />
        )}
        {/* placeholder */}
        {getTextContentWithoutZeroWidthSpace(internalRef?.current).length === 0 && (
          <Label
            className="sendbird-message-input--placeholder"
            type={LabelTypography.BODY_1}
            color={LabelColors.ONBACKGROUND_4}
          >
            {hasPendingFiles
              ? stringSet.MESSAGE_INPUT__PLACE_HOLDER__FILE_ATTACHED
              : (placeholder || stringSet.MESSAGE_INPUT__PLACE_HOLDER)}
          </Label>
        )}
        {/* send icon */}
        {!isEdit && (isInput || hasPendingFiles) && (
          <IconButton className="sendbird-message-input--send" height="32px" width="32px" onClick={() => sendMessage()} testID="sendbird-message-input-send-button">
            {renderSendMessageIcon?.() || (
              <Icon
                type={IconTypes.SEND}
                fillColor={disabled ? IconColors.ON_BACKGROUND_4 : IconColors.PRIMARY}
                width="20px"
                height="20px"
              />
            )}
          </IconButton>
        )}
        {/* file upload icon */}
        {!isEdit
          && !isInput
          && !hasPendingFiles
          && (renderFileUploadIcon?.()
            // UIKit Dashboard configuration should have lower priority than
            // renderFileUploadIcon which is set in code level
            || (isFileUploadEnabled && (
              <IconButton
                className={classnames('sendbird-message-input--attach', isVoiceMessageEnabled && 'is-voice-message-enabled')}
                height="32px"
                width="32px"
                onClick={() => {
                  // todo: clear previous input
                  fileInputRef?.current?.click?.();
                }}
              >
                <Icon
                  type={IconTypes.ATTACH}
                  fillColor={disabled ? IconColors.ON_BACKGROUND_4 : IconColors.CONTENT_INVERSE}
                  width="20px"
                  height="20px"
                />
                <input
                  className="sendbird-message-input--attach-input"
                  type="file"
                  ref={fileInputRef}
                  // It will affect to <Channel /> and <Thread />
                  onChange={(event) => uploadFile(event)}
                  accept={getMimeTypesUIKitAccepts(acceptableMimeTypes)}
                  multiple={isSelectingMultipleFilesEnabled && isChannelTypeSupportsMultipleFilesMessage(channel)}
                />
              </IconButton>
            )))}
        {/* voice message input trigger */}
        {isVoiceMessageEnabled && !isEdit && !isInput && !hasPendingFiles && (
          <IconButton
            className="sendbird-message-input--voice-message"
            width="32px"
            height="32px"
            onClick={onVoiceMessageIconClick}
          >
            {renderVoiceMessageIcon?.() || (
              <Icon
                type={IconTypes.AUDIO_ON_LINED}
                fillColor={disabled ? IconColors.ON_BACKGROUND_4 : IconColors.CONTENT_INVERSE}
                width="20px"
                height="20px"
              />
            )}
          </IconButton>
        )}
      </div>
      {/* Edit */}
      {isEdit && (
        <div className="sendbird-message-input--edit-action" data-testid="sendbird-message-input--edit-action">
          <Button
            className="sendbird-message-input--edit-action__cancel"
            type={ButtonTypes.SECONDARY}
            size={ButtonSizes.SMALL}
            onClick={onCancelEdit}
          >
            {stringSet.BUTTON__CANCEL}
          </Button>
          <Button
            className="sendbird-message-input--edit-action__save"
            type={ButtonTypes.PRIMARY}
            size={ButtonSizes.SMALL}
            disabled={isEditDisabled}
            onClick={() => editMessage()}
          >
            {stringSet.BUTTON__SAVE}
          </Button>
        </div>
      )}
    </form>
  );
});

export default MessageInput;
