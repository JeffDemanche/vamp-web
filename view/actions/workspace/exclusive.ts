import { EXCLUSIVE } from "../../constants/action-types";

interface SetPlayingAction {
  type: typeof EXCLUSIVE.SET_PLAYING;
  payload: boolean;
}

interface SetMetronomeSoundAction {
  type: typeof EXCLUSIVE.SET_METRONOME_SOUND;
  payload: string;
}

export const setPlaying = (payload: boolean) => {
  return { type: EXCLUSIVE.SET_PLAYING, payload };
};

export const setMetronomeSound = (payload: string) => {
  return { type: EXCLUSIVE.SET_METRONOME_SOUND, payload };
};

/**
 * Single exported type for use in other modules.
 */
export type ExclusiveActionTypes = SetPlayingAction | SetMetronomeSoundAction;
