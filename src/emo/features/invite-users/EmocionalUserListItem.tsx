import React from 'react';
import type { User } from '@sendbird/chat';

import UserListItem from '../../../ui/UserListItem';
import Label, { LabelColors, LabelTypography } from '../../../ui/Label';
import { getUserProfessionalTag } from '../metadata/user-tags';

export interface EmocionalUserListItemProps {
  user: User;
  onSelect: (userId: string) => void;
}

export const EmocionalUserListItem = ({ user, onSelect }: EmocionalUserListItemProps): React.ReactElement => {
  const professionalTag = getUserProfessionalTag(user);

  return (
    <div
      className="emo-invite-user-list-item"
      onClick={() => onSelect(user.userId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onSelect(user.userId);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <UserListItem user={user} />
      {professionalTag && (
        <Label
          className="emo-invite-user-list-item__tag"
          type={LabelTypography.CAPTION_2}
          color={LabelColors.ONBACKGROUND_2}
        >
          {professionalTag}
        </Label>
      )}
    </div>
  );
};

export default EmocionalUserListItem;
