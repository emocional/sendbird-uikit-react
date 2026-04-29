import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Logger } from '../../../lib/Sendbird/types';
import type { OpenGlobalModalProps } from '../../../hooks/useModal';
import type { StringSet } from '../../Label/stringSet';
import { isImage } from '../../../utils';
import { uuidv4 } from '../../../utils/uuid';
import { validateFileCount, validateFileSizes } from '../../../utils/fileValidation';

export interface PendingFile {
  id: string;
  file: File;
  /** Object URL for image previews. Undefined for non-image files. Revoked on remove/unmount. */
  previewUrl?: string;
  isImage: boolean;
}

export interface UsePendingFilesParams {
  uikitUploadSizeLimit: number;
  uikitMultipleFilesMessageLimit: number;
  openModal: (props: OpenGlobalModalProps) => void;
  stringSet: StringSet;
  logger?: Logger;
}

export interface UsePendingFilesReturn {
  pendingFiles: PendingFile[];
  /**
   * Adds files to the staging list. Validates combined-count + per-file size.
   * On count/size violation, opens the standard modal and rejects the batch.
   */
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clear: () => void;
  hasPendingFiles: boolean;
}

const buildPendingFile = (file: File): PendingFile => {
  const fileIsImage = isImage(file.type);
  return {
    id: uuidv4(),
    file,
    previewUrl: fileIsImage ? URL.createObjectURL(file) : undefined,
    isImage: fileIsImage,
  };
};

/**
 * Holds files staged for the message composer before send. Producers (file
 * picker, drag-and-drop, clipboard paste) all call addFiles. The owning
 * wrapper drains pendingFiles on submit and calls clear().
 */
export const usePendingFiles = ({
  uikitUploadSizeLimit,
  uikitMultipleFilesMessageLimit,
  openModal,
  stringSet,
  logger,
}: UsePendingFilesParams): UsePendingFilesReturn => {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const pendingFilesRef = useRef<PendingFile[]>(pendingFiles);
  pendingFilesRef.current = pendingFiles;

  const revokeUrl = useCallback((entry: PendingFile) => {
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
  }, []);

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const totalCount = pendingFilesRef.current.length + files.length;
    if (!validateFileCount({
      totalCount,
      uikitMultipleFilesMessageLimit,
      openModal,
      stringSet,
      logger,
      logTag: 'usePendingFiles',
    })) return;

    if (!validateFileSizes({
      files,
      uikitUploadSizeLimit,
      openModal,
      stringSet,
      logger,
      logTag: 'usePendingFiles',
    })) return;

    setPendingFiles((current) => [...current, ...files.map(buildPendingFile)]);
  }, [uikitUploadSizeLimit, uikitMultipleFilesMessageLimit, openModal, stringSet, logger]);

  const removeFile = useCallback((id: string) => {
    setPendingFiles((current) => {
      const target = current.find((entry) => entry.id === id);
      if (target) revokeUrl(target);
      return current.filter((entry) => entry.id !== id);
    });
  }, [revokeUrl]);

  const clear = useCallback(() => {
    pendingFilesRef.current.forEach(revokeUrl);
    setPendingFiles([]);
  }, [revokeUrl]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, []);

  const hasPendingFiles = useMemo(() => pendingFiles.length > 0, [pendingFiles]);

  return {
    pendingFiles,
    addFiles,
    removeFile,
    clear,
    hasPendingFiles,
  };
};
