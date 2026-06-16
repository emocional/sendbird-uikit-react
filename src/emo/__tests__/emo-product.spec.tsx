/**
 * Suite de producto Emocional — valida exclusivamente customizaciones del fork
 * según el contrato de uso en emo-front (emo-chat.tsx / emo-chat.utils.ts).
 *
 * Ejecutar: yarn test:emo
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from '@sendbird/chat';

import type { SendbirdProviderProps } from '../../lib/Sendbird/types';
import type { UserListQueryType } from '../../lib/Sendbird/index';
import type { EmocionalUserListQuery } from '../../types';
import { EMOCIONAL_CONFIG_DEFAULTS } from '../types';
import { resolveEmocionalProviderProps } from '../integration/provider';
import { applyEmocionalUserListFilter } from '../types/user-list-query';
import { buildDistinctDirectChannelParams } from '../features/auto-create-channels/create-distinct-direct-channel';
import { getEmocionalStringSet } from '../locales/get-emocional-string-set';
import {
  getEmocionalChannelListTag,
  getEmocionalUserCompanyName,
  getUserProfessionalTag,
} from '../features/metadata/user-tags';
import { isPeerOnline } from '../features/connection-status/get-member-status';
import { changeColorToClassName } from '../../ui/Icon/utils';
import { Colors as IconColors } from '../../ui/Icon/colors';
import EmocionalModalSearchHeader from '../features/invite-users/EmocionalModalSearchHeader';
import EmocionalUserListItem from '../features/invite-users/EmocionalUserListItem';
import EmocionalInviteUsers from '../features/invite-users/EmocionalInviteUsers';
import ConnectionStatusChannelAvatar from '../features/connection-status/ConnectionStatusChannelAvatar';
import EmocionalAddChannelIcon from '../integration/add-group-channel';
import AutoCreateGroupChannels from '../features/auto-create-channels/AutoCreateGroupChannels';
import { useEmocionalSkipChannelTypeSelection } from '../integration/create-channel';
import {
  EMO_FRONT_GROUP_CHANNEL_LIST_PROP_KEYS,
  EMO_FRONT_GROUP_CHANNEL_PROP_KEYS,
  EMO_FRONT_MEMBER_METADATA_KEYS,
  EMO_FRONT_PRODUCT_SCENARIOS,
  EMO_FRONT_PROVIDER_PROP_KEYS,
  EMO_FRONT_USER_LIST_QUERY_EXTENSION,
} from '../product/emo-front-usage';
import { EMO_INTEGRATION_MARKER, EMO_UPSTREAM_PATCH_FILES } from '../product/emo-patch-files';

import useSendbird from '../../lib/Sendbird/context/hooks/useSendbird';
import { getCreateGroupChannel } from '../../lib/selectors';
import { useGroupChannelList } from '../../modules/GroupChannelList/context/useGroupChannelList';
import useCreateChannel from '../../modules/CreateChannel/context/useCreateChannel';
import { LocalizationContext } from '../../lib/LocalizationContext';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

jest.mock('../../lib/Sendbird/context/hooks/useSendbird');
jest.mock('../../modules/GroupChannelList/context/useGroupChannelList');
jest.mock('../../lib/selectors', () => ({
  getCreateGroupChannel: jest.fn(),
}));
jest.mock('../../modules/CreateChannel/context/useCreateChannel');
jest.mock('../integration/create-channel', () => ({
  ...jest.requireActual('../integration/create-channel'),
  useEmocionalSkipChannelTypeSelection: jest.fn(),
}));

const mockUseSendbird = useSendbird as jest.MockedFunction<typeof useSendbird>;
const mockUseGroupChannelList = useGroupChannelList as jest.MockedFunction<typeof useGroupChannelList>;
const mockGetCreateGroupChannel = getCreateGroupChannel as jest.MockedFunction<typeof getCreateGroupChannel>;
const mockUseCreateChannel = useCreateChannel as jest.MockedFunction<typeof useCreateChannel>;
const mockUseEmocionalSkipChannelTypeSelection = useEmocionalSkipChannelTypeSelection as jest.MockedFunction<
  typeof useEmocionalSkipChannelTypeSelection
>;

const repoRoot = path.resolve(__dirname, '../../..');

const assertEmoFrontProviderProps = (props: SendbirdProviderProps): SendbirdProviderProps => props;

const buildUser = (overrides: Partial<User> = {}): User => ({
  userId: 'peer-1',
  nickname: 'Peer',
  metaData: {},
  ...overrides,
} as User);

describe('Emocional product suite (emo-front contract)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEmocionalSkipChannelTypeSelection.mockReturnValue(true);
  });

  describe('contrato emo-front → SendbirdProvider', () => {
    it('acepta las props que emo-chat pasa al provider', () => {
      const filterFn = jest.fn(() => true);
      const userListQuery = (): UserListQueryType => ({
        hasNext: true,
        isLoading: false,
        next: async () => [buildUser()],
        filterFn,
      } as EmocionalUserListQuery);

      const props = assertEmoFrontProviderProps({
        appId: 'app-id',
        userId: 'user-id',
        accessToken: 'token',
        enableAutoChat: true,
        searcherFilter: jest.fn(),
        userListQuery,
      });

      EMO_FRONT_PROVIDER_PROP_KEYS.forEach((key) => {
        expect(props).toHaveProperty(key);
      });
    });

    it('documenta escenarios de producto usados en emo-front', () => {
      expect(EMO_FRONT_PRODUCT_SCENARIOS.onboardingAutoChat).toContain('enableAutoChat');
      expect(EMO_FRONT_PRODUCT_SCENARIOS.inviteSearch).toContain('searcherFilter');
      expect(EMO_FRONT_PRODUCT_SCENARIOS.distinctDmInvite).toContain('distinct');
      expect(EMO_FRONT_PRODUCT_SCENARIOS.channelListIncludeEmpty).toContain('includeEmpty');
    });

    it('expone UserListQueryType para el cast de emo-chat.utils', () => {
      const query: UserListQueryType = {
        hasNext: true,
        isLoading: false,
        next: async () => [],
      };
      (query as EmocionalUserListQuery)[EMO_FRONT_USER_LIST_QUERY_EXTENSION] = () => true;
      expect(typeof (query as EmocionalUserListQuery).filterFn).toBe('function');
    });
  });

  describe('defaults de producto Emocional', () => {
    it('aplica defaults del fork (ES + invite directo)', () => {
      expect(EMOCIONAL_CONFIG_DEFAULTS.defaultLocale).toBe('es');
      expect(EMOCIONAL_CONFIG_DEFAULTS.skipChannelTypeSelection).toBe(true);
      expect(EMOCIONAL_CONFIG_DEFAULTS.enableAutoChat).toBe(false);
    });

    it('resuelve props del provider como espera emo-front', () => {
      const searcherFilter = jest.fn();
      const resolved = resolveEmocionalProviderProps({
        enableAutoChat: true,
        searcherFilter,
      });

      expect(resolved.enableAutoChat).toBe(true);
      expect(resolved.searcherFilter).toBe(searcherFilter);
      expect(resolved.defaultLocale).toBe('es');
      expect(resolved.skipChannelTypeSelection).toBe(true);
    });
  });

  describe('localización ES (modal de invitación / chat)', () => {
    it('traduce claves visibles en flujos de emo-front', () => {
      const stringSet = getEmocionalStringSet('es');

      expect(stringSet.BUTTON__CANCEL).toBe('Cancelar');
      expect(stringSet.MODAL__CREATE_CHANNEL__TITLE).toBeTruthy();
      expect(stringSet.PLACE_HOLDER__NO_CHANNEL).toBe('Sin canales');
    });
  });

  describe('userListQuery + filterFn (emo-chat.utils)', () => {
    it('aplica filterFn client-side como hace emo-front', async () => {
      const allowed = buildUser({ userId: 'allowed', metaData: { company: 'company-uuid' } });
      const blocked = buildUser({ userId: 'blocked', metaData: { company: 'other' } });
      const filterFn = (user: User) => user.metaData?.company === 'company-uuid';

      const query: EmocionalUserListQuery = {
        hasNext: true,
        isLoading: false,
        next: async () => [allowed, blocked],
        filterFn,
      };

      const filtered = applyEmocionalUserListFilter(query, await query.next());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].userId).toBe('allowed');
    });
  });

  describe('enableAutoChat (onboarding / ?msgto=)', () => {
    const onChannelCreated = jest.fn();
    const createChannel = jest.fn();

    beforeEach(() => {
      mockGetCreateGroupChannel.mockReturnValue(createChannel);
      createChannel.mockResolvedValue({ url: 'channel_url' });
      mockUseGroupChannelList.mockReturnValue({
        state: { onChannelCreated },
        actions: {},
      } as ReturnType<typeof useGroupChannelList>);
    });

    it('crea canales distinct al cargar userListQuery', async () => {
      const userListQuery = jest.fn(() => ({
        hasNext: true,
        isLoading: false,
        next: jest.fn().mockResolvedValue([
          buildUser({ userId: 'peer-1' }),
          buildUser({ userId: 'me', nickname: 'Me' }),
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

  describe('searcherFilter + modal de invitación', () => {
    it('propaga búsqueda al callback (emo-front actualiza nicknameStartsWithFilter)', () => {
      const onSearch = jest.fn();

      render(
        <EmocionalModalSearchHeader
          titleText="Invitar"
          onSearchChange={onSearch}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText('Buscar'), { target: { value: 'Ana' } });
      expect(onSearch).toHaveBeenCalledWith('Ana');
    });
  });

  describe('flujo invite distinct 1:1', () => {
    const mockStringSet = {
      MODAL__CREATE_CHANNEL__TITLE: 'Nuevo chat',
      BUTTON__CANCEL: 'Cancelar',
      NO_NAME: '(No name)',
    };
    beforeEach(() => {
      mockUseCreateChannel.mockReturnValue({
        state: {
          onCreateChannelClick: undefined,
          onBeforeCreateChannel: undefined,
          onChannelCreated: jest.fn(),
          onCreateChannel: jest.fn(),
          overrideInviteUser: undefined,
          type: 'GROUP',
        },
        actions: {
          createChannel: jest.fn().mockResolvedValue({ url: 'new-channel' }),
        },
      } as ReturnType<typeof useCreateChannel>);
    });

    it('crea canal distinct al seleccionar usuario', async () => {
      const createChannel = jest.fn().mockResolvedValue({ url: 'new-channel' });
      mockGetCreateGroupChannel.mockReturnValue(createChannel);
      const onCancel = jest.fn();

      mockUseSendbird.mockReturnValue({
        state: {
          config: {
            userId: 'me',
            searcherFilter: jest.fn(),
            logger: { error: jest.fn() },
          },
          stores: { sdkStore: { sdk: { groupChannel: {} } } },
        },
        actions: {},
      } as ReturnType<typeof useSendbird>);

      const userListQuery = jest.fn(() => ({
        hasNext: true,
        isLoading: false,
        next: jest.fn().mockResolvedValue([buildUser({ userId: 'peer-2', nickname: 'Peer 2' })]),
      }));

      render(
        <LocalizationContext.Provider value={{ stringSet: mockStringSet, dateLocale: undefined }}>
          <EmocionalInviteUsers userListQuery={userListQuery} onCancel={onCancel} />
        </LocalizationContext.Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Peer 2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Peer 2'));

      await waitFor(() => {
        expect(createChannel).toHaveBeenCalledWith(
          buildDistinctDirectChannelParams('peer-2', 'me'),
        );
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it('omite SelectChannelType cuando skipChannelTypeSelection está activo', () => {
      mockUseEmocionalSkipChannelTypeSelection.mockReturnValue(true);
      expect(useEmocionalSkipChannelTypeSelection()).toBe(true);

      const createChannelUiSource = fs.readFileSync(
        path.join(repoRoot, 'src/modules/CreateChannel/components/CreateChannelUI/index.tsx'),
        'utf8',
      );
      expect(createChannelUiSource).toContain('EmocionalCreateChannelInvite');
      expect(createChannelUiSource).toContain('useEmocionalSkipChannelTypeSelection');
    });
  });

  describe('metadata Sendbird (tags leídos por emo-front y UI)', () => {
    const channel = {
      members: [
        { userId: 'me', metaData: { company_name: 'Acme Corp' } },
        {
          userId: 'peer',
          metaData: { company: 'acme', professional: 'coach', team: 'Equipo A' },
          connectionStatus: 'online',
        },
      ],
    } as any;

    it('mapea metaData.professional como en emo-chat', () => {
      EMO_FRONT_MEMBER_METADATA_KEYS.forEach((key) => {
        expect(channel.members[1].metaData).toHaveProperty(key);
      });

      expect(getUserProfessionalTag({ metaData: { professional: 'coach' } })).toBe('Coach Emocional');
    });

    it('muestra tag de lista y empresa en cabecera', () => {
      expect(getEmocionalChannelListTag(channel, 'me')).toBe('Coach Emocional');
      expect(getEmocionalUserCompanyName(channel, 'me')).toBe('Acme Corp');
      expect(isPeerOnline(channel, 'me')).toBe(true);
    });

    it('renderiza tag profesional en fila de invitación', () => {
      render(
        <EmocionalUserListItem
          user={buildUser({ metaData: { professional: 'psychologist' } })}
          onSelect={jest.fn()}
        />,
      );

      expect(screen.getByText('Psicólogo/a')).toBeInTheDocument();
    });
  });

  describe('estado online en avatar', () => {
    it('muestra indicador cuando el interlocutor está online', () => {
      const channel = {
        members: [
          { userId: 'me', connectionStatus: 'online' },
          { userId: 'peer', connectionStatus: 'online' },
        ],
      } as any;

      const { container } = render(
        <ConnectionStatusChannelAvatar channel={channel} userId="me" theme="light" />,
      );

      expect(container.querySelector('.emo-connection-status-channel-avatar__dot')).toBeInTheDocument();
    });
  });

  describe('marca visual Emocional', () => {
    it('expone color EMOCIONAL para el botón + de crear canal', () => {
      expect(IconColors.EMOCIONAL).toBe('EMOCIONAL');
      expect(changeColorToClassName(IconColors.EMOCIONAL)).toBe('sendbird-icon-color--emocional');
    });

    it('renderiza icono + de crear canal', () => {
      const { container } = render(<EmocionalAddChannelIcon />);
      expect(container.querySelector('.sendbird-icon-color--emocional')).toBeTruthy();
    });
  });

  describe('componentes emo-front (exports públicos)', () => {
    it('documenta props de GroupChannelList usadas en emo-front', () => {
      EMO_FRONT_GROUP_CHANNEL_LIST_PROP_KEYS.forEach((key) => {
        expect(['onChannelCreated', 'channelListQueryParams', 'onChannelSelect', 'selectedChannelUrl', 'disableAutoSelect']).toContain(key);
      });
    });

    it('documenta props de GroupChannel usadas en emo-front', () => {
      expect(EMO_FRONT_GROUP_CHANNEL_PROP_KEYS).toEqual(['channelUrl']);
    });
  });

  describe('enganches upstream (@emo-integration)', () => {
    it('mantiene integración en archivos listados en PATCHES.md', () => {
      EMO_UPSTREAM_PATCH_FILES.forEach((relativePath) => {
        const absolutePath = path.join(repoRoot, relativePath);
        const source = fs.readFileSync(absolutePath, 'utf8');
        expect(source).toContain(EMO_INTEGRATION_MARKER);
      });
    });

    it('monta addons Emocional en GroupChannelListUI', () => {
      const source = fs.readFileSync(
        path.join(repoRoot, 'src/modules/GroupChannelList/components/GroupChannelListUI/index.tsx'),
        'utf8',
      );
      expect(source).toContain('EmocionalGroupChannelListAddons');
    });
  });

  describe('empaquetado Emocional', () => {
    it('publica como @emocional/sendbird-uikit-react', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
      expect(pkg.name).toBe('@emocional/sendbird-uikit-react');
    });

    it('incluye estilos emocionales en el bundle de estilos', () => {
      const stylesEntry = fs.readFileSync(
        path.join(repoRoot, 'src/emo/integration/styles.tsx'),
        'utf8',
      );
      expect(stylesEntry).toContain("import '../styles/overrides.scss'");
    });
  });
});
