import { useCallback } from 'react';

import { Logger } from '../../../../lib/Sendbird/types';
import { SendMFMFunctionType } from './useSendMultipleFilesMessage';
import { SendableMessageType, isImage } from '../../../../utils';
// TODO: get SendFileMessageFunctionType from Channel
import { SendFileMessageFunctionType } from '../../../Thread/context/hooks/useSendFileMessage';
import { useGlobalModalContext } from '../../../../hooks/useModal';
import { useLocalization } from '../../../../lib/LocalizationContext';
import { FileMessage, MultipleFilesMessage } from '@sendbird/chat/message';
import { compressImages } from '../../../../utils/compressImages';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
import { validateFilesForUpload } from '../../../../utils/fileValidation';

/**
 * The handleUploadFiles is a function sending a FileMessage and MultipleFilesMessage
 * by the received FileList from the ChangeEvent of MessageInput component.
 */

interface useHandleUploadFilesDynamicProps {
  sendFileMessage: SendFileMessageFunctionType;
  sendMultipleFilesMessage: SendMFMFunctionType;
  quoteMessage?: SendableMessageType;
}
interface useHandleUploadFilesStaticProps {
  logger: Logger;
}

export const useHandleUploadFiles = ({
  sendFileMessage,
  sendMultipleFilesMessage,
  quoteMessage,
}: useHandleUploadFilesDynamicProps, {
  logger,
}: useHandleUploadFilesStaticProps) => {
  const { stringSet } = useLocalization();
  const { state: { config } } = useSendbird();
  const { imageCompression } = config;
  const uikitUploadSizeLimit = config?.uikitUploadSizeLimit;
  const uikitMultipleFilesMessageLimit = config?.uikitMultipleFilesMessageLimit;
  const { openModal } = useGlobalModalContext();

  const handleUploadFiles = useCallback(async (files: File[]) => {
    // Validate Parameters
    if (!sendFileMessage || !sendMultipleFilesMessage) {
      logger.warning('Channel|useHandleUploadFiles: required functions are undefined', { sendFileMessage, sendMultipleFilesMessage });
      return;
    }

    const isValid = validateFilesForUpload({
      files,
      uikitUploadSizeLimit,
      uikitMultipleFilesMessageLimit,
      openModal,
      stringSet,
      logger,
      logTag: 'Channel|useHandleUploadFiles',
    });
    if (!isValid) return;

    // Image Compression
    const { compressedFiles } = await compressImages({
      files,
      imageCompression,
      logger,
    });
    const sendingFiles = compressedFiles;

    // Send File Message
    if (sendingFiles.length === 1) {
      logger.info('Channel|useHandleUploadFiles: sending one file.');
      const [file] = sendingFiles;
      sendFileMessage(file, quoteMessage);
    } else if (sendingFiles.length > 1) {
      logger.info('Channel|useHandleUploadFiles: sending multiple files.');

      // Divide to images & non-images
      const imageFiles: Array<File> = [];
      const otherFiles: Array<File> = [];
      sendingFiles.forEach((file: File) => {
        if (isImage(file.type)) {
          imageFiles.push(file);
        } else {
          otherFiles.push(file);
        }
      });

      return otherFiles.reduce((
        previousPromise: Promise<MultipleFilesMessage | FileMessage | void>,
        item: File,
      ) => {
        return previousPromise.then(() => {
          return sendFileMessage(item as File, quoteMessage);
        });
      }, (() => {
        if (imageFiles.length === 0) {
          return Promise.resolve();
        } else if (imageFiles.length === 1) {
          return sendFileMessage(imageFiles[0], quoteMessage);
        } else {
          return sendMultipleFilesMessage(imageFiles, quoteMessage);
        }
      })());
    }
  }, [
    sendFileMessage,
    sendMultipleFilesMessage,
    quoteMessage,
  ]);

  return handleUploadFiles;
};
