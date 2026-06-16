import React from 'react';

import './index.scss';
import Header, { HeaderCustomProps } from '../../../../ui/Header';
// @emo-integration
import EmocionalGroupChannelListHeaderTitle from '../../../../emo/integration/group-channel-list-header';

export interface GroupChannelListHeaderProps extends HeaderCustomProps {
  /** @deprecated Use the props `renderMiddle` instead */
  renderTitle?: () => React.ReactElement;
  renderIconButton?: (props: void) => React.ReactElement;
  onEdit?: (props: void) => void;
  allowProfileEdit?: boolean;
}

export const GroupChannelListHeader = ({
  renderTitle,
  renderIconButton,
  // Header custom props
  renderLeft,
  renderMiddle,
  renderRight,
}: GroupChannelListHeaderProps) => {
  const renderProfile = renderMiddle ?? renderTitle;

  return (
    <Header
      className="sendbird-channel-header"
      renderLeft={renderLeft}
      renderMiddle={() => (
        renderProfile?.() ?? <EmocionalGroupChannelListHeaderTitle />
      )}
      renderRight={renderRight ?? renderIconButton}
    />
  );
};

export default GroupChannelListHeader;
