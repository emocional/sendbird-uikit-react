import { useEffect } from 'react';

export interface UseDragAndDropParams {
  onAddFiles: (files: File[]) => void;
  /** When true, listeners are not attached (e.g. mobile, channel disabled). */
  disabled?: boolean;
}

const dragHasFiles = (event: DragEvent): boolean => {
  // dataTransfer.types is the only reliable cross-browser signal during dragover;
  // dataTransfer.files is empty until drop in most browsers.
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
};

/**
 * Window-level drag-and-drop for file uploads. While enabled, the entire
 * viewport accepts file drops — the caller does not need to render a visual
 * affordance.
 *
 * When disabled, no listeners are attached, so the browser's default drop
 * behavior (open the file) is preserved.
 */
export const useDragAndDrop = ({ onAddFiles, disabled = false }: UseDragAndDropParams): void => {
  useEffect(() => {
    if (disabled) return undefined;

    const onDragOver = (event: DragEvent) => {
      if (!dragHasFiles(event)) return;
      // Required to mark the document as a valid drop target and suppress
      // the browser's default "open file" behavior on drop.
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };

    const onDrop = (event: DragEvent) => {
      if (!dragHasFiles(event)) return;
      event.preventDefault();
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length > 0) onAddFiles(files);
    };

    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [disabled, onAddFiles]);
};
