import React, { useCallback, useContext, useEffect } from 'react';
import { LocalizationContext } from '../../../../lib/LocalizationContext';
import MessageInput from '../../../../ui/MessageInput';
import type { PendingFile } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { usePendingFiles } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { useOpenChannelContext } from '../../context/OpenChannelProvider';
import { useGlobalModalContext } from '../../../../hooks/useModal';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';

export type MessageInputWrapperProps = {
  value?: string;
};

export default React.forwardRef<HTMLInputElement, MessageInputWrapperProps>((props, ref) => {
  const { currentOpenChannel, disabled, handleSendMessage, handleFileUpload, amIMuted } = useOpenChannelContext();

  const channel = currentOpenChannel;

  const { stringSet } = useContext(LocalizationContext);
  const { openModal } = useGlobalModalContext();
  const { state: { config } } = useSendbird();
  const { uikitUploadSizeLimit, uikitMultipleFilesMessageLimit, logger } = config;
  const { value } = props;

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

  useEffect(() => {
    clearPendingFiles();
  }, [currentOpenChannel?.url]);

  // OpenChannel does not support MultipleFilesMessage. Files send sequentially via FileMessage,
  // with the body text attached to the first send. handleSendMessage reads the textarea ref
  // directly, so the composer's text body lands on the UserMessage when files are absent.
  const handleSubmit = useCallback(({
    message,
    files,
  }: { message: string; mentionTemplate: string; files: PendingFile[] }) => {
    const trimmed = message.trim();

    if (files.length === 0) {
      if (trimmed.length === 0) return;
      handleSendMessage();
    } else {
      handleFileUpload(
        files.map((entry) => entry.file),
        trimmed.length > 0 ? { message } : undefined,
      );
    }

    clearPendingFiles();
  }, [handleSendMessage, handleFileUpload, clearPendingFiles]);

  function getPlaceHolderString() {
    if (amIMuted) {
      return stringSet.MESSAGE_INPUT__PLACE_HOLDER__MUTED;
    }
    if (disabled) {
      return stringSet.MESSAGE_INPUT__PLACE_HOLDER__DISABLED;
    }
    return '';
  }

  if (!channel) {
    return null;
  }
  return (
    <div className="sendbird-openchannel-footer">
      <MessageInput
        channel={currentOpenChannel}
        ref={ref}
        value={value}
        disabled={disabled}
        isVoiceMessageEnabled={false}
        pendingFiles={pendingFiles}
        onAddFiles={addFiles}
        onRemoveFile={removeFile}
        onSubmit={handleSubmit}
        placeholder={getPlaceHolderString()}
      />
    </div>
  );
});
