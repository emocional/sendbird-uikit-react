import React, { ReactElement, useContext, useState } from 'react';

import type { PendingFile } from '../hooks/usePendingFiles';
import Icon, { IconColors, IconTypes } from '../../Icon';
import { LocalizationContext } from '../../../lib/LocalizationContext';
import PendingFileCard from './PendingFileCard';

interface Props {
  pendingFile: PendingFile;
  onRemove: (id: string) => void;
}

/**
 * Renders one staged file in the composer. Images get a square thumbnail with
 * a corner remove button; non-images delegate to PendingFileCard, which
 * shows a horizontal card with icon + filename + uppercased extension.
 */
export const PendingFileItem = ({ pendingFile, onRemove }: Props): ReactElement => {
  const { stringSet } = useContext(LocalizationContext);
  const { id, file, previewUrl, isImage } = pendingFile;
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isImage) {
    return <PendingFileCard pendingFile={pendingFile} onRemove={onRemove} />;
  }

  return (
    <div className="sendbird-message-input__pending-file" data-testid="sendbird-pending-file">
      <div className="sendbird-message-input__pending-file__thumbnail">
        {previewUrl && (
          <img
            className="sendbird-message-input__pending-file__image"
            src={previewUrl}
            alt={file.name}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        {!imageLoaded && (
          <div className="sendbird-message-input__pending-file__image-placeholder">
            <Icon
              type={IconTypes.PHOTO}
              fillColor={IconColors.ON_BACKGROUND_2}
              width="32px"
              height="32px"
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
            type={IconTypes.REMOVE}
            width="22px"
            height="22px"
          />
        </button>
      </div>
    </div>
  );
};

export default PendingFileItem;
