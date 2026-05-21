import React, { ReactElement, useContext, useMemo } from 'react';

import type { PendingFile } from '../hooks/usePendingFiles';
import Icon, { IconColors, IconTypes } from '../../Icon';
import Label, { LabelColors, LabelTypography } from '../../Label';
import { LocalizationContext } from '../../../lib/LocalizationContext';
import { truncateMiddleKeepExtension } from '../../../utils/truncateMiddleKeepExtension';

interface Props {
  pendingFile: PendingFile;
  onRemove: (id: string) => void;
}

const META_WIDTH_PX = 108;
const FILENAME_FONT = '700 14px Roboto, sans-serif';

function fitFilenameToWidth(filename: string): string {
  if (typeof document === 'undefined') return filename;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return filename;
  ctx.font = FILENAME_FONT;
  if (ctx.measureText(filename).width <= META_WIDTH_PX) return filename;

  let lo = 3;
  let hi = filename.length;
  let best = '...';
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const candidate = truncateMiddleKeepExtension(filename, mid);
    if (ctx.measureText(candidate).width <= META_WIDTH_PX) {
      best = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

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
  const displayName = useMemo(() => fitFilenameToWidth(file.name), [file.name]);
  const extLabel = getExtensionLabel(file.name, stringSet.MESSAGE_INPUT__PENDING_FILE__TYPE_UNKNOWN);

  return (
    <div className="sendbird-message-input__pending-card" data-testid="sendbird-pending-file">
      <div className="sendbird-message-input__pending-card__body">
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
            type={LabelTypography.CAPTION_2}
            color={LabelColors.ONBACKGROUND_2}
          >
            {extLabel}
          </Label>
        </div>
      </div>
      <button
        type="button"
        className="sendbird-message-input__pending-card__remove"
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
  );
};

export default PendingFileCard;
