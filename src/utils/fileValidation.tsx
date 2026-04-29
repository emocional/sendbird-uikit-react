import React from 'react';

import type { Logger } from '../lib/Sendbird/types';
import type { OpenGlobalModalProps } from '../hooks/useModal';
import type { StringSet } from '../ui/Label/stringSet';
import { ButtonTypes } from '../ui/Button';
import { ModalFooter } from '../ui/Modal';
import { ONE_MiB } from './consts';

interface OpenSimpleModalParams {
  openModal: (props: OpenGlobalModalProps) => void;
  titleText: string;
  okText: string;
}

const openAcknowledgeModal = ({ openModal, titleText, okText }: OpenSimpleModalParams) => {
  openModal({
    modalProps: { titleText, hideFooter: true },
    childElement: ({ closeModal }) => (
      <ModalFooter
        type={ButtonTypes.PRIMARY}
        submitText={okText}
        hideCancelButton
        onCancel={closeModal}
        onSubmit={closeModal}
      />
    ),
  });
};

interface CountLimitParams {
  totalCount: number;
  uikitMultipleFilesMessageLimit: number;
  openModal: (props: OpenGlobalModalProps) => void;
  stringSet: StringSet;
  logger?: Logger;
  logTag?: string;
}

/**
 * Validates that the resulting file count (existing + incoming) does not
 * exceed the configured limit. Opens the count-limit modal on failure.
 * Returns true when within limit.
 */
export const validateFileCount = ({
  totalCount,
  uikitMultipleFilesMessageLimit,
  openModal,
  stringSet,
  logger,
  logTag = 'validateFileCount',
}: CountLimitParams): boolean => {
  if (totalCount <= uikitMultipleFilesMessageLimit) return true;

  logger?.info(`${logTag}: Cannot upload files more than ${uikitMultipleFilesMessageLimit}`);
  openAcknowledgeModal({
    openModal,
    titleText: stringSet.FILE_UPLOAD_NOTIFICATION__COUNT_LIMIT.replace('%d', `${uikitMultipleFilesMessageLimit}`),
    okText: stringSet.BUTTON__OK,
  });
  return false;
};

interface SizeLimitParams {
  files: File[];
  uikitUploadSizeLimit: number;
  openModal: (props: OpenGlobalModalProps) => void;
  stringSet: StringSet;
  logger?: Logger;
  logTag?: string;
}

/**
 * Validates that no file exceeds the configured size limit. Opens the
 * size-limit modal on failure. Returns true when all files within limit.
 */
export const validateFileSizes = ({
  files,
  uikitUploadSizeLimit,
  openModal,
  stringSet,
  logger,
  logTag = 'validateFileSizes',
}: SizeLimitParams): boolean => {
  if (!files.some((file) => file.size > uikitUploadSizeLimit)) return true;

  logger?.info(`${logTag}: Cannot upload file size exceeding ${uikitUploadSizeLimit}`);
  openAcknowledgeModal({
    openModal,
    titleText: stringSet.FILE_UPLOAD_NOTIFICATION__SIZE_LIMIT.replace('%d', `${Math.floor(uikitUploadSizeLimit / ONE_MiB)}`),
    okText: stringSet.BUTTON__OK,
  });
  return false;
};

export interface ValidateFilesForUploadParams {
  files: File[];
  uikitUploadSizeLimit: number;
  uikitMultipleFilesMessageLimit: number;
  openModal: (props: OpenGlobalModalProps) => void;
  stringSet: StringSet;
  logger?: Logger;
  /** Logger context tag (e.g. 'GroupChannel|useHandleUploadFiles'). */
  logTag?: string;
}

/**
 * Validates a File[] before upload. Used by the legacy immediate-send hooks.
 * Composer staging (usePendingFiles) calls validateFileCount and
 * validateFileSizes directly so it can check combined-with-staging count.
 */
export const validateFilesForUpload = ({
  files,
  uikitUploadSizeLimit,
  uikitMultipleFilesMessageLimit,
  openModal,
  stringSet,
  logger,
  logTag = 'validateFilesForUpload',
}: ValidateFilesForUploadParams): boolean => {
  if (files.length === 0) {
    logger?.warning(`${logTag}: given file list is empty.`, { files });
    return false;
  }

  if (!validateFileCount({
    totalCount: files.length,
    uikitMultipleFilesMessageLimit,
    openModal,
    stringSet,
    logger,
    logTag,
  })) return false;

  if (!validateFileSizes({
    files,
    uikitUploadSizeLimit,
    openModal,
    stringSet,
    logger,
    logTag,
  })) return false;

  return true;
};
