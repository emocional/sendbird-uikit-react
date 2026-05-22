import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { LocalizationContext } from '../../../../lib/LocalizationContext';
import MessageInput from '../../../../ui/MessageInput';
import type { PendingFile } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { usePendingFiles } from '../../../../ui/MessageInput/hooks/usePendingFiles';
import { useDragAndDrop } from '../../../../ui/MessageInput/hooks/useDragAndDrop';
import { checkIfFileUploadEnabled, filterFilesForUpload } from '../../../../ui/MessageInput/messageInputUtils';
import { useMediaQueryContext } from '../../../../lib/MediaQueryContext';
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
  const { uikitUploadSizeLimit, logger } = config;
  const { isMobile } = useMediaQueryContext();
  const { value } = props;

  const {
    pendingFiles,
    addFiles,
    removeFile,
    clear: clearPendingFiles,
  } = usePendingFiles({
    uikitUploadSizeLimit,
    uikitMultipleFilesMessageLimit: 1,
    openModal,
    stringSet,
    logger,
  });

  const isFileUploadEnabled = checkIfFileUploadEnabled({ channel: currentOpenChannel ?? undefined, config });
  const handleDroppedFiles = useCallback((dropped: File[]) => {
    const accepted = filterFilesForUpload(dropped, { allowMultipleFiles: false });
    if (accepted.length === 0) return;
    addFiles(accepted);
  }, [addFiles]);
  useDragAndDrop({
    onAddFiles: handleDroppedFiles,
    disabled: isMobile || disabled || !isFileUploadEnabled,
  });

  useEffect(() => {
    clearPendingFiles();
  }, [currentOpenChannel?.url]);

  // OpenChannel does not support MultipleFilesMessage. Files send sequentially
  // via FileMessage and the composer's text body is suppressed when files are
  // present (matches GroupChannel/Thread behavior). handleSendMessage reads the
  // textarea ref directly, so text-only sends still land on UserMessage as
  // before.
  const isSubmittingFilesRef = useRef(false);
  const handleSubmit = useCallback(({
    message,
    files,
  }: { message: string; mentionTemplate: string; files: PendingFile[] }) => {
    const trimmed = message.trim();

    if (files.length === 0) {
      if (trimmed.length === 0) return;
      handleSendMessage();
      return;
    }

    if (isSubmittingFilesRef.current) return;
    isSubmittingFilesRef.current = true;

    clearPendingFiles();

    try {
      handleFileUpload(files.map((entry) => entry.file));
    } finally {
      isSubmittingFilesRef.current = false;
    }
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
        channelUrl={currentOpenChannel?.url}
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
