import { useEffect } from 'react';

export interface UseDragAndDropParams {
  onAddFiles: (files: File[]) => void;
  /** When true, listeners are not attached (e.g. mobile, channel disabled). */
  disabled?: boolean;
  /**
   * Per-event filter. Return `false` to skip this drop entirely (no preventDefault,
   * no onAddFiles). Default: accept every file drop. Used to coordinate multiple
   * instances on the same page so each one only consumes drops in its own pane —
   * e.g. main channel vs. thread.
   */
  shouldAccept?: (event: DragEvent) => boolean;
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
 *
 * When multiple instances are mounted concurrently (e.g. main channel composer
 * + thread composer on desktop), each one passes a `shouldAccept` predicate so
 * exactly one consumes any given drop based on its position in the DOM.
 */
export const useDragAndDrop = ({ onAddFiles, disabled = false, shouldAccept }: UseDragAndDropParams): void => {
  useEffect(() => {
    if (disabled) return undefined;

    const onDragOver = (event: DragEvent) => {
      if (!dragHasFiles(event)) return;
      if (shouldAccept && !shouldAccept(event)) return;
      // Required to mark the document as a valid drop target and suppress
      // the browser's default "open file" behavior on drop.
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };

    const onDrop = (event: DragEvent) => {
      if (!dragHasFiles(event)) return;
      if (shouldAccept && !shouldAccept(event)) return;
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
  }, [disabled, onAddFiles, shouldAccept]);
};
