import {
  getEmocionalChannelListTag,
  getEmocionalUserCompanyName,
  getProfessionalTagLabel,
  getUserProfessionalTag,
} from '../user-tags';
import { isPeerOnline, getPeerConnectionStatuses } from '../../connection-status/get-member-status';

describe('emo metadata', () => {
  it('maps professional metadata labels', () => {
    expect(getProfessionalTagLabel('coach')).toBe('Coach Emocional');
    expect(getProfessionalTagLabel('psychologist')).toBe('Psicólogo/a');
    expect(getProfessionalTagLabel('custom')).toBe('custom');
  });

  it('reads professional tag from user metadata', () => {
    expect(getUserProfessionalTag({ metaData: { professional: 'coach' } })).toBe('Coach Emocional');
  });

  it('resolves channel list tag from peer metadata', () => {
    const channel = {
      members: [
        { userId: 'me', metaData: {} },
        { userId: 'peer', metaData: { company: 'acme', professional: 'coach' } },
      ],
    } as any;

    expect(getEmocionalChannelListTag(channel, 'me')).toBe('Coach Emocional');
  });

  it('resolves company name from current user metadata', () => {
    const channel = {
      members: [
        { userId: 'me', metaData: { company_name: 'Acme Corp' } },
        { userId: 'peer', metaData: {} },
      ],
    } as any;

    expect(getEmocionalUserCompanyName(channel, 'me')).toBe('Acme Corp');
  });
});

describe('emo connection status', () => {
  it('detects online peer', () => {
    const channel = {
      members: [
        { userId: 'me', connectionStatus: 'online' },
        { userId: 'peer', connectionStatus: 'online' },
      ],
    } as any;

    expect(getPeerConnectionStatuses(channel, 'me')).toEqual(['online']);
    expect(isPeerOnline(channel, 'me')).toBe(true);
  });
});
