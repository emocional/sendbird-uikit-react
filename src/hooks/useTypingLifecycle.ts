import { useCallback, useEffect, useRef } from 'react';

type TypingChannel = {
  url?: string;
  startTyping?: () => void;
  endTyping?: () => void;
} | null | undefined;

/**
 * Tracks typing lifecycle on a Sendbird channel and ensures `endTyping` is
 * sent when the channel changes, the `active` flag toggles to false, or the
 * component unmounts. Returns memoized `startTyping`/`stopTyping` helpers
 * that the caller wires to input events.
 *
 * @param channel - the channel currently being typed in
 * @param active  - when set to false, the cleanup runs and clears typing
 *                  state. Useful for edit-mode wrappers that pass `showEdit`
 *                  so closing the edit panel emits `endTyping`.
 */
export function useTypingLifecycle(
  channel: TypingChannel,
  active: boolean = true,
): { startTyping: () => void; stopTyping: () => void } {
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    channel?.startTyping?.();
    isTypingRef.current = true;
  }, [channel]);

  const stopTyping = useCallback(() => {
    channel?.endTyping?.();
    isTypingRef.current = false;
  }, [channel]);

  // Send endTyping on channel change, active toggle, or unmount
  // (uses the captured channel reference so the previous channel is notified).
  useEffect(() => {
    const ch = channel;
    return () => {
      if (isTypingRef.current) {
        ch?.endTyping?.();
        isTypingRef.current = false;
      }
    };
  }, [channel?.url, active]);

  return { startTyping, stopTyping };
}
