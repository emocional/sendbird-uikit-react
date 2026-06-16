import React from 'react';
import * as useCreateChannelModule from '../../../context/useCreateChannel';
import { CHANNEL_TYPE } from '../../../types';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LocalizationContext } from '../../../../../lib/LocalizationContext';
import CreateChannelUI from '../index';
import { useEmocionalSkipChannelTypeSelection } from '../../../../../emo/integration/create-channel';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

jest.mock('../../../../../emo/integration/create-channel', () => {
  const actual = jest.requireActual('../../../../../emo/integration/create-channel');
  return {
    __esModule: true,
    default: actual.default,
    EmocionalCreateChannelInvite: actual.EmocionalCreateChannelInvite,
    useEmocionalSkipChannelTypeSelection: jest.fn(),
  };
});

jest.mock('../../../../../lib/Sendbird/context/hooks/useSendbird', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    state: {
      stores: {
        userStore: {
          user: {
            userId: ' test-user-id',
          },
        },
        sdkStore: {
          sdk: {
            currentUser: {
              userId: 'test-user-id',
            },
            createApplicationUserListQuery: () => ({
              next: () => Promise.resolve([{ userId: 'test-user-id' }]),
              isLoading: false,
            }),
          },
          initialized: true,
        },
      },
      config: {
        logger: console,
        userId: 'test-user-id',
        groupChannel: {
          enableMention: true,
        },
        isOnline: true,
      },
    },
  })),
}));
jest.mock('../../../context/useCreateChannel');

const mockUseEmocionalSkipChannelTypeSelection = useEmocionalSkipChannelTypeSelection as jest.MockedFunction<
  typeof useEmocionalSkipChannelTypeSelection
>;

const mockStringSet = {
  MODAL__CREATE_CHANNEL__TITLE: 'CREATE_CHANNEL',
  MODAL__INVITE_MEMBER__SELECTED: 'USERS_SELECTED',
  BUTTON__CREATE: 'CREATE',
  NO_NAME: '(No name)',
};

const mockLocalizationContext = {
  stringSet: mockStringSet,
};

const defaultMockState = {
  sdk: undefined,
  userListQuery: undefined,
  onCreateChannelClick: undefined,
  onChannelCreated: undefined,
  onBeforeCreateChannel: undefined,
  pageStep: 0,
  type: CHANNEL_TYPE.GROUP,
  onCreateChannel: undefined,
  overrideInviteUser: undefined,
};

const defaultMockActions = {
  setPageStep: jest.fn(),
  setType: jest.fn(),
};

describe('CreateChannelUI Integration Tests', () => {
  const mockUseCreateChannel = useCreateChannelModule.default as jest.Mock;

  const renderComponent = (mockState = {}, mockActions = {}) => {
    mockUseCreateChannel.mockReturnValue({
      state: { ...defaultMockState, ...mockState },
      actions: { ...defaultMockActions, ...mockActions },
    });

    return render(
      <LocalizationContext.Provider value={mockLocalizationContext as any}>
        <CreateChannelUI />
      </LocalizationContext.Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id='sendbird-modal-root' />
    `;
  });

  describe('flujo upstream (skipChannelTypeSelection = false)', () => {
    beforeEach(() => {
      mockUseEmocionalSkipChannelTypeSelection.mockReturnValue(false);
    });

    it('display initial state correctly', () => {
      renderComponent();

      expect(screen.getByText('CREATE_CHANNEL')).toBeInTheDocument();
    });

    it('display SelectChannelType when pageStep is 0', () => {
      renderComponent({ pageStep: 0 });

      expect(screen.getByText('CREATE_CHANNEL')).toBeInTheDocument();
    });

    it('display InviteUsers when pageStep is 1', async () => {
      await act(async () => {
        renderComponent({ pageStep: 1 });
      });

      expect(screen.getByText('0 USERS_SELECTED')).toBeInTheDocument();
    });
  });

  describe('flujo Emocional (skipChannelTypeSelection = true)', () => {
    beforeEach(() => {
      mockUseEmocionalSkipChannelTypeSelection.mockReturnValue(true);
    });

    it('avanza a invite directo al montar en pageStep 0', () => {
      renderComponent({ pageStep: 0 });

      expect(defaultMockActions.setPageStep).toHaveBeenCalledWith(1);
    });

    it('display EmocionalInviteUsers when pageStep is 1', async () => {
      await act(async () => {
        renderComponent({ pageStep: 1 });
      });

      expect(screen.getByText('CREATE_CHANNEL')).toBeInTheDocument();
      expect(screen.queryByText('0 USERS_SELECTED')).not.toBeInTheDocument();
    });
  });
});
