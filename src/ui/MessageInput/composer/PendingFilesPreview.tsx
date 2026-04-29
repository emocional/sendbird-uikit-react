import React, { ReactElement } from 'react';

import type { PendingFile } from '../hooks/usePendingFiles';
import PendingFileItem from './PendingFileItem';

interface Props {
  pendingFiles: PendingFile[];
  onRemove: (id: string) => void;
  className?: string;
}

export const PendingFilesPreview = ({ pendingFiles, onRemove, className }: Props): ReactElement | null => {
  if (pendingFiles.length === 0) return null;

  const classNames = ['sendbird-message-input__pending-preview', className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      data-testid="sendbird-pending-files-preview"
      role="list"
    >
      {pendingFiles.map((entry) => (
        <PendingFileItem key={entry.id} pendingFile={entry} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default PendingFilesPreview;
