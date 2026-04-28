import { renderHook, act } from '@testing-library/react';
import { useTypingLifecycle } from '../useTypingLifecycle';

const makeChannel = (url = 'channel-a') => ({
  url,
  startTyping: jest.fn(),
  endTyping: jest.fn(),
});

describe('useTypingLifecycle', () => {
  it('startTyping calls channel.startTyping', () => {
    const channel = makeChannel();
    const { result } = renderHook(() => useTypingLifecycle(channel));

    act(() => result.current.startTyping());

    expect(channel.startTyping).toHaveBeenCalledTimes(1);
    expect(channel.endTyping).not.toHaveBeenCalled();
  });

  it('stopTyping calls channel.endTyping', () => {
    const channel = makeChannel();
    const { result } = renderHook(() => useTypingLifecycle(channel));

    act(() => result.current.startTyping());
    act(() => result.current.stopTyping());

    expect(channel.endTyping).toHaveBeenCalledTimes(1);
  });

  it('calls endTyping on unmount when typing was active', () => {
    const channel = makeChannel();
    const { result, unmount } = renderHook(() => useTypingLifecycle(channel));

    act(() => result.current.startTyping());
    unmount();

    expect(channel.endTyping).toHaveBeenCalledTimes(1);
  });

  it('does not call endTyping on unmount when typing was never active', () => {
    const channel = makeChannel();
    const { unmount } = renderHook(() => useTypingLifecycle(channel));

    unmount();

    expect(channel.endTyping).not.toHaveBeenCalled();
  });

  it('does not duplicate endTyping when stopTyping called before unmount', () => {
    const channel = makeChannel();
    const { result, unmount } = renderHook(() => useTypingLifecycle(channel));

    act(() => result.current.startTyping());
    act(() => result.current.stopTyping());
    unmount();

    expect(channel.endTyping).toHaveBeenCalledTimes(1);
  });

  it('calls endTyping on previous channel when channel changes', () => {
    const channelA = makeChannel('a');
    const channelB = makeChannel('b');

    const { result, rerender } = renderHook(
      ({ channel }) => useTypingLifecycle(channel),
      { initialProps: { channel: channelA } },
    );

    act(() => result.current.startTyping());
    expect(channelA.startTyping).toHaveBeenCalledTimes(1);

    rerender({ channel: channelB });

    expect(channelA.endTyping).toHaveBeenCalledTimes(1);
    expect(channelB.endTyping).not.toHaveBeenCalled();
  });

  it('calls endTyping when active toggles to false', () => {
    const channel = makeChannel();

    const { result, rerender } = renderHook(
      ({ active }) => useTypingLifecycle(channel, active),
      { initialProps: { active: true } },
    );

    act(() => result.current.startTyping());
    rerender({ active: false });

    expect(channel.endTyping).toHaveBeenCalledTimes(1);
  });

  it('does not call endTyping when active toggles to false without typing', () => {
    const channel = makeChannel();

    const { rerender } = renderHook(
      ({ active }) => useTypingLifecycle(channel, active),
      { initialProps: { active: true } },
    );

    rerender({ active: false });

    expect(channel.endTyping).not.toHaveBeenCalled();
  });

  it('handles null channel gracefully', () => {
    const { result, unmount } = renderHook(() => useTypingLifecycle(null));

    expect(() => {
      act(() => result.current.startTyping());
      act(() => result.current.stopTyping());
      unmount();
    }).not.toThrow();
  });
});
