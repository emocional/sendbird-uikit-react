import { useEffect, useRef } from 'react';
import { useVoicePlayerContext } from '.';
import { VOICE_PLAYER_AUDIO_ID, VOICE_MESSAGE_MIME_TYPE } from '../../utils/consts';
import { useVoiceRecorderContext } from '../VoiceRecorder';

import { AudioUnitDefaultValue, VOICE_PLAYER_STATUS, VoicePlayerStatusType } from './dux/initialState';
import { generateGroupKey } from './utils';

export interface UseVoicePlayerProps {
  key?: string;
  channelUrl?: string;
  audioFile?: File;
  audioFileUrl?: string;
  audioFileMimeType?: string;
}

export interface UseVoicePlayerContext {
  play: () => void;
  pause: () => void;
  stop: (text?: string) => void;
  playbackTime: number;
  duration: number;
  playingStatus: VoicePlayerStatusType;
}

export const useVoicePlayer = ({
  key = '',
  channelUrl = '',
  audioFile,
  audioFileUrl = '',
  audioFileMimeType = VOICE_MESSAGE_MIME_TYPE,
}: UseVoicePlayerProps): UseVoicePlayerContext => {
  const groupKey = generateGroupKey(channelUrl, key);
  const {
    play,
    pause,
    stop,
    reset,
    voicePlayerStore,
  } = useVoicePlayerContext();
  const { isRecordable } = useVoiceRecorderContext();
  const currentAudioUnit = voicePlayerStore?.audioStorage?.[groupKey] || AudioUnitDefaultValue();
  const currentAudioUnitRef = useRef(currentAudioUnit);
  currentAudioUnitRef.current = currentAudioUnit;

  const playVoicePlayer = () => {
    if (!isRecordable) {
      play?.({
        groupKey,
        audioFile,
        audioFileUrl,
        audioFileMimeType,
      });
    }
  };

  const pauseVoicePlayer = () => {
    pause?.(groupKey);
  };

  const stopVoicePlayer = (text = '') => {
    stop?.(text);
  };

  useEffect(() => {
    return () => {
      if (audioFile || audioFileUrl) {
        // Pause via DOM because reset() captured in this closure has stale currentPlayer
        const voiceAudioPlayerElement = document.getElementById(VOICE_PLAYER_AUDIO_ID);
        (voiceAudioPlayerElement as HTMLAudioElement)?.pause?.();
        const status = currentAudioUnitRef.current?.playingStatus;
        if (status && status !== VOICE_PLAYER_STATUS.IDLE) {
          reset?.(groupKey);
        }
      }
    };
  }, []);

  return ({
    play: playVoicePlayer,
    pause: pauseVoicePlayer,
    stop: stopVoicePlayer,
    /**
     * The reason why we multiply this by *1000 is,
     * The unit of playbackTime and duration should be millisecond
     */
    playbackTime: (currentAudioUnit?.playbackTime || 0) * 1000,
    duration: (currentAudioUnit?.duration || 0) * 1000,
    playingStatus: currentAudioUnit.playingStatus,
  });
};
