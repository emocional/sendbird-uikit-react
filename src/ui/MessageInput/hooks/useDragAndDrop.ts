import { DragEvent, useCallback, useRef, useState } from 'react';

export interface UseDragAndDropParams {
  onAddFiles: (files: File[]) => void;
  /** When true, ignore drag events entirely (e.g. mobile, channel disabled). */
  disabled?: boolean;
}

export interface DragAndDropHandlers {
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

export interface UseDragAndDropReturn {
  isDragging: boolean;
  handlers: DragAndDropHandlers;
}

const dragHasFiles = (event: DragEvent<HTMLElement>): boolean => {
  // dataTransfer.types is the only reliable cross-browser signal during dragenter/over;
  // dataTransfer.files is empty until drop in most browsers.
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
};

/**
 * Manages drag-and-drop state for a file-accepting region. Uses a counter ref
 * so that dragging across child elements does not flicker the overlay
 * (dragenter on a child fires immediately before dragleave on the parent).
 */
export const useDragAndDrop = ({ onAddFiles, disabled = false }: UseDragAndDropParams): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const counterRef = useRef(0);

  const reset = useCallback(() => {
    counterRef.current = 0;
    setIsDragging(false);
  }, []);

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    if (!dragHasFiles(event)) return;
    event.preventDefault();
    counterRef.current += 1;
    if (counterRef.current === 1) setIsDragging(true);
  }, [disabled]);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    if (!dragHasFiles(event)) return;
    // Required to mark the element as a valid drop target.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    if (!dragHasFiles(event)) return;
    counterRef.current = Math.max(counterRef.current - 1, 0);
    if (counterRef.current === 0) setIsDragging(false);
  }, [disabled]);

  const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    event.preventDefault();
    reset();
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length > 0) onAddFiles(files);
  }, [disabled, onAddFiles, reset]);

  return {
    isDragging,
    handlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
};
