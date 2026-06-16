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

describe('emo/integration/message-header', () => {
  it('renders sender name and time in one row', () => {
    const message = {
      createdAt: new Date('2024-06-15T14:30:00').getTime(),
      sender: { userId: 'u1', nickname: 'Ana' },
    };

    const { container } = render(
      <EmocionalMessageHeader channel={null} message={message as never} />,
    );

    expect(container.querySelector('.emo-message-header__name')?.textContent).toBe('Ana');
    expect(container.querySelector('.emo-message-header__time')?.textContent).toBeTruthy();
  });
});
