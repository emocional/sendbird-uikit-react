import React, { ReactElement, useEffect, useRef } from 'react';

import type { PendingFile } from '../hooks/usePendingFiles';
import PendingFileItem from './PendingFileItem';

interface Props {
  pendingFiles: PendingFile[];
  onRemove: (id: string) => void;
  className?: string;
}

export const PendingFilesPreview = ({ pendingFiles, onRemove, className }: Props): ReactElement | null => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(pendingFiles.length);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (e.deltaY === 0 || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (pendingFiles.length > prevCountRef.current) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }
    prevCountRef.current = pendingFiles.length;
  }, [pendingFiles.length]);

  if (pendingFiles.length === 0) return null;

  const classNames = ['sendbird-message-input__pending-preview', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
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
