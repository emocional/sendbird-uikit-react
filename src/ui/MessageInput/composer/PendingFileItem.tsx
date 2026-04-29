import React, { ReactElement, useContext } from 'react';

import type { PendingFile } from '../hooks/usePendingFiles';
import Icon, { IconColors, IconTypes } from '../../Icon';
import Label, { LabelColors, LabelTypography } from '../../Label';
import { LocalizationContext } from '../../../lib/LocalizationContext';

interface Props {
  pendingFile: PendingFile;
  onRemove: (id: string) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const PendingFileItem = ({ pendingFile, onRemove }: Props): ReactElement => {
  const { stringSet } = useContext(LocalizationContext);
  const { id, file, previewUrl, isImage } = pendingFile;

  return (
    <div className="sendbird-message-input__pending-file" data-testid="sendbird-pending-file">
      <div className="sendbird-message-input__pending-file__thumbnail">
        {isImage && previewUrl ? (
          <img
            className="sendbird-message-input__pending-file__image"
            src={previewUrl}
            alt={file.name}
          />
        ) : (
          <div className="sendbird-message-input__pending-file__icon">
            <Icon
              type={IconTypes.FILE_DOCUMENT}
              fillColor={IconColors.ON_BACKGROUND_2}
              width="24px"
              height="24px"
            />
          </div>
        )}
        <button
          type="button"
          className="sendbird-message-input__pending-file__remove"
          aria-label={stringSet.MESSAGE_INPUT__PENDING_FILE__REMOVE}
          onClick={() => onRemove(id)}
        >
          <Icon
            type={IconTypes.CLOSE}
            fillColor={IconColors.CONTENT_INVERSE}
            width="16px"
            height="16px"
          />
        </button>
      </div>
      {!isImage && (
        <div className="sendbird-message-input__pending-file__meta">
          <Label
            className="sendbird-message-input__pending-file__name"
            type={LabelTypography.CAPTION_2}
            color={LabelColors.ONBACKGROUND_1}
          >
            {file.name}
          </Label>
          <Label
            className="sendbird-message-input__pending-file__size"
            type={LabelTypography.CAPTION_3}
            color={LabelColors.ONBACKGROUND_2}
          >
            {formatBytes(file.size)}
          </Label>
        </div>
      )}
    </div>
  );
};

export default PendingFileItem;
