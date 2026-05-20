import React, { ReactElement, useContext } from 'react';

import type { PendingFile } from '../hooks/usePendingFiles';
import Icon, { IconColors, IconTypes } from '../../Icon';
import Label, { LabelColors, LabelTypography } from '../../Label';
import { LocalizationContext } from '../../../lib/LocalizationContext';
import { truncateMiddleKeepExtension } from '../../../utils/truncateMiddleKeepExtension';

interface Props {
  pendingFile: PendingFile;
  onRemove: (id: string) => void;
}

/** Maximum filename characters to render before middle-truncation kicks in.
 * Sized for the card width across desktop / mobile-web / mobile-thread —
 * narrower viewports will visually crop further via CSS overflow, but the
 * truncated string still preserves the extension. */
const FILENAME_MAX_CHARS = 22;

/** Extract the uppercased extension from the filename, falling back to a
 * localized "FILE" label when no extension is present. */
function getExtensionLabel(filename: string, fallback: string): string {
  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx <= 0 || dotIdx === filename.length - 1) return fallback;
  return filename.slice(dotIdx + 1).toUpperCase();
}

/**
 * Card representation of a non-image pending file in the composer. Used in
 * place of the square image thumbnail when `pendingFile.isImage` is false.
 * The card shows a generic file icon, the (middle-truncated) filename, and
 * the uppercased extension label.
 */
export const PendingFileCard = ({ pendingFile, onRemove }: Props): ReactElement => {
  const { stringSet } = useContext(LocalizationContext);
  const { id, file } = pendingFile;
  const displayName = truncateMiddleKeepExtension(file.name, FILENAME_MAX_CHARS);
  const extLabel = getExtensionLabel(file.name, stringSet.MESSAGE_INPUT__PENDING_FILE__TYPE_UNKNOWN);

  return (
    <div className="sendbird-message-input__pending-card" data-testid="sendbird-pending-file">
      <div className="sendbird-message-input__pending-card__icon">
        <Icon
          type={IconTypes.FILE_DOCUMENT}
          fillColor={IconColors.PRIMARY}
          width="24px"
          height="24px"
        />
      </div>
      <div className="sendbird-message-input__pending-card__meta">
        <Label
          className="sendbird-message-input__pending-card__name"
          type={LabelTypography.CAPTION_1}
          color={LabelColors.ONBACKGROUND_1}
        >
          {displayName}
        </Label>
        <Label
          className="sendbird-message-input__pending-card__type"
          type={LabelTypography.CAPTION_3}
          color={LabelColors.ONBACKGROUND_2}
        >
          {extLabel}
        </Label>
      </div>
      <button
        type="button"
        className="sendbird-message-input__pending-card__remove"
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
  );
};

export default PendingFileCard;
