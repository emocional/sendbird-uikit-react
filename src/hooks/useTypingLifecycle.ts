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
  // Holds the channel that startTyping was last invoked on. Storing the
  // actual reference (rather than a boolean flag) ensures endTyping is sent
  // on the same channel instance that received startTyping, even if the
  // channel object is re-instantiated under the same URL.
  const typingChannelRef = useRef<TypingChannel>(null);

  const startTyping = useCallback(() => {
    channel?.startTyping?.();
    typingChannelRef.current = channel ?? null;
  }, [channel]);

  const stopTyping = useCallback(() => {
    typingChannelRef.current?.endTyping?.();
    typingChannelRef.current = null;
  }, []);

  // Run cleanup on channel URL change, active toggle, or unmount.
  // Reads typingChannelRef so endTyping is sent on the channel where
  // startTyping was actually invoked.
  useEffect(() => {
    return () => {
      if (typingChannelRef.current) {
        typingChannelRef.current.endTyping?.();
        typingChannelRef.current = null;
      }
    };
  }, [channel?.url, active]);

  return { startTyping, stopTyping };
}
