import React from 'react';
import { render } from '@testing-library/react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import { EmocionalMessageMenu, EmocionalReplyButton } from '../message-menu';
import { MessageMenu } from '../../../ui/MessageMenu';
import useSendbird from '../../../lib/Sendbird/context/hooks/useSendbird';

jest.mock('../../../ui/MessageMenu', () => ({
  MessageMenu: jest.fn(() => null),
}));

jest.mock('../../../lib/Sendbird/context/hooks/useSendbird');

const mockMessageMenu = MessageMenu as jest.MockedFunction<typeof MessageMenu>;
const mockUseSendbird = useSendbird as jest.MockedFunction<typeof useSendbird>;

const buildMessage = (overrides: Record<string, unknown> = {}) => ({
  messageId: 1,
  messageType: 'user',
  message: 'hola',
  sender: { userId: 'peer-1' },
  parentMessageId: 0,
  ...overrides,
});

const buildChannel = () => ({
  isGroupChannel: () => true,
  isEphemeral: false,
  isBroadcast: false,
}) as unknown as GroupChannel;

describe('emo/integration/message-menu', () => {
  beforeEach(() => {
    mockUseSendbird.mockReturnValue({
      state: {
        config: {
          groupChannel: { enableMarkAsUnread: false },
        },
      },
    } as ReturnType<typeof useSendbird>);
    mockMessageMenu.mockClear();
  });

  it('renders reply button outside the dropdown when quote reply is enabled', () => {
    const setQuoteMessage = jest.fn();
    const { container } = render(
      <EmocionalReplyButton
        channel={buildChannel()}
        message={buildMessage() as never}
        replyType="QUOTE_REPLY"
        setQuoteMessage={setQuoteMessage}
      />,
    );

    expect(container.querySelector('.emo-message-reply-button')).toBeTruthy();
  });

  it('omits reply from EmocionalMessageMenu items', () => {
    render(
      <EmocionalMessageMenu
        message={buildMessage() as never}
        channel={buildChannel()}
        replyType="QUOTE_REPLY"
        isByMe={false}
      />,
    );

    const renderMenuItems = mockMessageMenu.mock.calls[0]?.[0]?.renderMenuItems;
    expect(renderMenuItems).toBeDefined();

    const ReplyMenuItem = jest.fn(() => null);
    const CopyMenuItem = jest.fn(() => null);

    const menuItems = renderMenuItems?.({
      items: {
        CopyMenuItem,
        ReplyMenuItem,
        ThreadMenuItem: jest.fn(() => null),
        OpenInChannelMenuItem: jest.fn(() => null),
        EditMenuItem: jest.fn(() => null),
        MarkAsUnreadMenuItem: jest.fn(() => null),
        ResendMenuItem: jest.fn(() => null),
        DeleteMenuItem: jest.fn(() => null),
      },
    });

    render(<>{menuItems}</>);

    expect(CopyMenuItem).toHaveBeenCalled();
    expect(ReplyMenuItem).not.toHaveBeenCalled();
  });

  it('returns null when the emocional menu has no visible items', () => {
    const { container } = render(
      <EmocionalMessageMenu
        message={buildMessage({ messageType: 'file' }) as never}
        channel={buildChannel()}
        replyType="QUOTE_REPLY"
        isByMe={false}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(mockMessageMenu).not.toHaveBeenCalled();
  });
});
