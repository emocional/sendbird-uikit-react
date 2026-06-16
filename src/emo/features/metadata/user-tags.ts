import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { User } from '@sendbird/chat';

const PROFESSIONAL_LABELS: Record<string, string> = {
  coach: 'Coach Emocional',
  psychologist: 'Psicólogo/a',
};

export const getProfessionalTagLabel = (professionalMetadata?: string): string | null => {
  if (!professionalMetadata) {
    return null;
  }
  return PROFESSIONAL_LABELS[professionalMetadata] ?? professionalMetadata;
};

const readMeta = (metaData?: object): Record<string, string> => (
  (metaData ?? {}) as Record<string, string>
);

export const getUserProfessionalTag = (user: User | { metaData?: object }): string | null => {
  const professional = readMeta(user.metaData).professional;
  return professional ? getProfessionalTagLabel(professional) : null;
};

/** Tag bajo el nombre en la lista de canales (profesional o equipo). */
export const getEmocionalChannelListTag = (
  channel: GroupChannel | undefined,
  currentUserId: string,
): string | null => {
  if (!channel?.members?.length) {
    return null;
  }

  const peer = channel.members.find((member) => member.userId !== currentUserId);
  const peerMeta = readMeta(peer?.metaData);
  if (!peerMeta.company) {
    return null;
  }

  const professional = peerMeta.professional;
  if (professional) {
    return getProfessionalTagLabel(professional);
  }

  return peerMeta.team ?? null;
};

/** Badge de empresa en cabecera del chat (`company_name` del usuario actual). */
export const getEmocionalUserCompanyName = (
  channel: GroupChannel | undefined,
  currentUserId: string,
): string | null => {
  const currentUser = channel?.members?.find((member) => member.userId === currentUserId);
  const company = readMeta(currentUser?.metaData).company_name;
  return company ? String(company) : null;
};
