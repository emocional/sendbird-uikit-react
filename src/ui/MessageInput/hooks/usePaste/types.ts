import type { User } from '@sendbird/chat';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { OpenChannel } from '@sendbird/chat/openChannel';

export type Word = {
  text: string;
  userId?: string;
};

export type DynamicProps = {
  ref: React.RefObject<HTMLInputElement> | null;
  channel: OpenChannel | GroupChannel;
  setMentionedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setIsInput: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * When provided, files in the clipboard short-circuit the text/html paste
   * branch and are routed here for composer staging.
   */
  onAddFiles?: (files: File[]) => void;
};
