import type { GroupChannel } from '@sendbird/chat/groupChannel';

import {
  filterVisibleGroupChannels,
  isGroupChannelVisibleInList,
} from '../filterVisibleGroupChannels';

const channel = (url: string, hasMessage: boolean): GroupChannel =>
  ({
    url,
    lastMessage: hasMessage ? { message: 'hi' } : null,
  }) as GroupChannel;

describe('filterVisibleGroupChannels', () => {
  it('keeps channels with messages', () => {
    const withMessage = channel('with-message', true);
    const empty = channel('empty', false);

    expect(isGroupChannelVisibleInList(withMessage, undefined)).toBe(true);
    expect(filterVisibleGroupChannels([withMessage, empty])).toEqual([withMessage]);
  });

  it('shows an empty channel only when it is selected', () => {
    const empty = channel('empty-selected', false);

    expect(isGroupChannelVisibleInList(empty, 'other-channel')).toBe(false);
    expect(isGroupChannelVisibleInList(empty, 'empty-selected')).toBe(true);
    expect(filterVisibleGroupChannels([empty], 'empty-selected')).toEqual([empty]);
    expect(filterVisibleGroupChannels([empty], 'other-channel')).toEqual([]);
  });
});
