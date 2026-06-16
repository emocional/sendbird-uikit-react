import React from 'react';
import { render } from '@testing-library/react';

import { EmocionalMessageHeader } from '../message-header';

jest.mock('../../../lib/LocalizationContext', () => ({
  useLocalization: () => ({
    dateLocale: undefined,
    stringSet: {
      DATE_FORMAT__MESSAGE_CREATED_AT: 'p',
    },
  }),
}));

jest.mock('../../../lib/Sendbird/context/hooks/useSendbird', () => ({
  __esModule: true,
  default: () => ({
    state: {
      config: {
        userId: 'me',
      },
    },
    actions: {},
  }),
}));

describe('emo/integration/message-header', () => {
  it('renders sender name and time for incoming messages', () => {
    const message = {
      createdAt: new Date('2024-06-15T14:30:00').getTime(),
      sender: { userId: 'peer-1', nickname: 'Ana' },
    };

    const { container } = render(
      <EmocionalMessageHeader channel={null} message={message as never} />,
    );

    expect(container.querySelector('.emo-message-header__name')?.textContent).toBe('Ana');
    expect(container.querySelector('.emo-message-header__time')?.textContent).toBeTruthy();
    expect(container.querySelector('.emo-message-header__status')).toBeNull();
  });

  it('renders message status instead of plain time for own messages', () => {
    const message = {
      createdAt: new Date('2024-06-15T14:30:00').getTime(),
      sendingStatus: 'succeeded',
      sender: { userId: 'me', nickname: 'Yo' },
    };

    const { container } = render(
      <EmocionalMessageHeader channel={null} message={message as never} />,
    );

    expect(container.querySelector('.emo-message-header__time')).toBeNull();
    expect(container.querySelector('.emo-message-header__status')).toBeTruthy();
  });
});
