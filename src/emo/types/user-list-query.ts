import type { User } from '@sendbird/chat';

import type { UserListQuery } from '../../lib/Sendbird/types';

/** Extensión de UserListQuery con filtro client-side (emo-front / profesionales). */
export type EmocionalUserListQuery = UserListQuery & {
  filterFn?: (user: User) => boolean;
};

export const applyEmocionalUserListFilter = (query: UserListQuery, users: User[]): User[] => {
  const filterFn = (query as EmocionalUserListQuery).filterFn;
  if (typeof filterFn === 'function') {
    return users.filter(filterFn);
  }
  return users;
};
