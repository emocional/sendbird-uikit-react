import React, { useCallback } from 'react';
import type { OpenChannel } from '@sendbird/chat/openChannel';
import type { FileMessageCreateParams } from '@sendbird/chat/message';

import type { Logger, SdkStore, ImageCompressionOptions } from '../../../../lib/Sendbird/types';
import * as messageActionTypes from '../dux/actionTypes';
import * as utils from '../utils';
import { compressImages } from '../../../../utils/compressImages';
import { useGlobalModalContext } from '../../../../hooks/useModal';
import { useLocalization } from '../../../../lib/LocalizationContext';
import { ONE_MiB } from '../../../../utils/consts';
import { ModalFooter } from '../../../../ui/Modal';
import { ButtonTypes } from '../../../../ui/Button';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';

interface DynamicParams {
  currentOpenChannel: OpenChannel | null;
  onBeforeSendFileMessage?: (file: File) => FileMessageCreateParams;
  checkScrollBottom: () => boolean;
  imageCompression?: ImageCompressionOptions;
}
interface StaticParams {
  sdk: SdkStore['sdk'];
  logger: Logger;
  messagesDispatcher: (props: { type: string, payload: any }) => void;
  scrollRef: React.RefObject<HTMLElement>;
}

export interface FileUploadOptions {
  /** Optional text body. Attached to the FIRST file's params.message when onBeforeSendFileMessage did not already set one. */
  message?: string;
  /** Optional mentioned users. Attached to the FIRST file send. */
  mentionedUsers?: import('@sendbird/chat').User[];
  /** Optional mention template; SDK type omits this on FileMessage but server accepts it. */
  mentionedMessageTemplate?: string;
}

type CallbackReturn = (files: Array<File> | File, options?: FileUploadOptions) => Promise<void>;

function useFileUploadCallback({
  currentOpenChannel,
  imageCompression = {},
  onBeforeSendFileMessage,
}: DynamicParams,
{ sdk, logger, messagesDispatcher, scrollRef }: StaticParams,
): CallbackReturn {
  const { stringSet } = useLocalization();
  const { openModal } = useGlobalModalContext();
  const { state: { config: { uikitUploadSizeLimit } } } = useSendbird();

  return useCallback(async (files, options) => {
    if (!sdk) return;
    const fileList = Array.isArray(files) ? files : [files];

    const createCustomParams = onBeforeSendFileMessage && typeof onBeforeSendFileMessage === 'function';

    const createParamsDefault = (file: File): FileMessageCreateParams => {
      const params: FileMessageCreateParams = {};
      params.file = file;
      return params;
    };

    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];

      // Validate file size
      if (file.size > uikitUploadSizeLimit) {
        logger.info(`OpenChannel | useFileUploadCallback: Cannot upload file size exceeding ${uikitUploadSizeLimit}`);
        openModal({
          modalProps: {
            titleText: stringSet.FILE_UPLOAD_NOTIFICATION__SIZE_LIMIT.replace('%d', `${Math.floor(uikitUploadSizeLimit / ONE_MiB)}`),
            hideFooter: true,
          },
          childElement: ({ closeModal }) => (
            <ModalFooter
              type={ButtonTypes.PRIMARY}
              submitText={stringSet.BUTTON__OK}
              hideCancelButton
              onCancel={closeModal}
              onSubmit={closeModal}
            />
          ),
        });
        return;
      }

      // Image compression
      // eslint-disable-next-line no-await-in-loop
      const { compressedFiles } = await compressImages({
        files: [file],
        imageCompression,
        logger,
      });
      const [compressedFile] = compressedFiles;

      if (createCustomParams) {
        logger.info('OpenChannel | useFileUploadCallback: Creating params using onBeforeSendFileMessage', onBeforeSendFileMessage);
      }
      const params = onBeforeSendFileMessage ? onBeforeSendFileMessage(compressedFile) : createParamsDefault(compressedFile);
      // Attach text body + mention metadata to the first send only.
      if (i === 0) {
        if (options?.message && !params.message) {
          params.message = options.message;
        }
        if (options?.mentionedUsers && !params.mentionedUsers) {
          params.mentionedUsers = options.mentionedUsers;
        }
        if (options?.mentionedMessageTemplate) {
          (params as FileMessageCreateParams & { mentionedMessageTemplate?: string }).mentionedMessageTemplate = options.mentionedMessageTemplate;
        }
      }
      logger.info('OpenChannel | useFileUploadCallback: Uploading file message start', params);

      currentOpenChannel?.sendFileMessage(params)
        .onPending((pendingMessage) => {
          messagesDispatcher({
            type: messageActionTypes.SENDING_MESSAGE_START,
            payload: {
              // TODO: remove data pollution
              message: {
                ...pendingMessage,
                url: URL.createObjectURL(file),
                // pending thumbnail message seems to be failed
                requestState: 'pending',
                isUserMessage: pendingMessage.isUserMessage,
                isFileMessage: pendingMessage.isFileMessage,
                isAdminMessage: pendingMessage.isAdminMessage,
                isMultipleFilesMessage: pendingMessage.isMultipleFilesMessage,
              },
              channel: currentOpenChannel,
            },
          });

          setTimeout(() => utils.scrollIntoLast(0, scrollRef));
        })
        .onSucceeded((message) => {
          logger.info('OpenChannel | useFileUploadCallback: Sending message succeeded', message);
          messagesDispatcher({
            type: messageActionTypes.SENDING_MESSAGE_SUCCEEDED,
            payload: message,
          });
        })
        .onFailed((error, message) => {
          logger.error('OpenChannel | useFileUploadCallback: Sending file message failed', { message, error });
          // @ts-ignore
          message.localUrl = URL.createObjectURL(file);
          // @ts-ignore
          message.file = file;
          messagesDispatcher({
            type: messageActionTypes.SENDING_MESSAGE_FAILED,
            payload: message,
          });
        });
    }
  }, [currentOpenChannel, onBeforeSendFileMessage, imageCompression]);
}

export default useFileUploadCallback;
