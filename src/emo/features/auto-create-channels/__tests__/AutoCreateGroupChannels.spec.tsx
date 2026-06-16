import React from 'react';
import { render, waitFor } from '@testing-library/react';

import AutoCreateGroupChannels from '../AutoCreateGroupChannels';
import useSendbird from '../../../../lib/Sendbird/context/hooks/useSendbird';
import { useGroupChannelList } from '../../../../modules/GroupChannelList/context/useGroupChannelList';
import { getCreateGroupChannel } from '../../../../lib/selectors';

jest.mock('../../../../lib/Sendbird/context/hooks/useSendbird');
jest.mock('../../../../modules/GroupChannelList/context/useGroupChannelList');
jest.mock('../../../../lib/selectors', () => ({
  getCreateGroupChannel: jest.fn(),
}));

const mockUseSendbird = useSendbird as jest.MockedFunction<typeof useSendbird>;
const mockUseGroupChannelList = useGroupChannelList as jest.MockedFunction<typeof useGroupChannelList>;
const mockGetCreateGroupChannel = getCreateGroupChannel as jest.MockedFunction<typeof getCreateGroupChannel>;

describe('AutoCreateGroupChannels', () => {
  const onChannelCreated = jest.fn();
  const createChannel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCreateGroupChannel.mockReturnValue(createChannel);
    createChannel.mockResolvedValue({ url: 'channel_url' });
    mockUseGroupChannelList.mockReturnValue({
      state: { onChannelCreated },
      actions: {},
    } as ReturnType<typeof useGroupChannelList>);
  });

  it('does nothing when enableAutoChat is false', async () => {
    mockUseSendbird.mockReturnValue({
      state: {
        config: {
          enableAutoChat: false,
          userListQuery: jest.fn(),
          userId: 'me',
          logger: { error: jest.fn() },
        },
        stores: { sdkStore: { sdk: { groupChannel: {} } } },
      },
      actions: {},
    } as ReturnType<typeof useSendbird>);

    render(<AutoCreateGroupChannels />);

    await waitFor(() => {
      expect(createChannel).not.toHaveBeenCalled();
    });
  });

  it('creates distinct channels for users when enableAutoChat is true', async () => {
    const userListQuery = jest.fn(() => ({
      hasNext: true,
      isLoading: false,
      next: jest.fn().mockResolvedValue([
        { userId: 'peer-1', nickname: 'Peer' },
        { userId: 'me', nickname: 'Me' },
      ]),
    }));

    mockUseSendbird.mockReturnValue({
      state: {
        config: {
          enableAutoChat: true,
          userListQuery,
          userId: 'me',
          logger: { error: jest.fn() },
        },
        stores: { sdkStore: { sdk: { groupChannel: {} } } },
      },
      actions: {},
    } as ReturnType<typeof useSendbird>);

    render(<AutoCreateGroupChannels />);

    await waitFor(() => {
      expect(createChannel).toHaveBeenCalledWith({
        invitedUserIds: ['peer-1'],
        isDistinct: true,
        operatorUserIds: ['me'],
      });
      expect(onChannelCreated).toHaveBeenCalledWith({ url: 'channel_url' });
    });
  });
});
