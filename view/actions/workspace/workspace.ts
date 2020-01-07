import { EXCLUSIVE } from "../../constants/action-types";
import { SHARED } from "../../constants/action-types";

export interface SetPlayingAction {
  type: typeof EXCLUSIVE.SET_PLAYING;
  payload: boolean;
}

export interface SetMetronomeSoundAction {
  type: typeof EXCLUSIVE.SET_METRONOME_SOUND;
  payload: string;
}

export interface SetBPMAction {
  type: typeof SHARED.SET_BPM;
  payload: number;
}

export interface SetBeatsPerBarAction {
  type: typeof SHARED.SET_BEATS_PER_BAR;
  payload: number;
}

export const setPlaying = (payload: boolean): SetPlayingAction => {
  return { type: EXCLUSIVE.SET_PLAYING, payload };
};

export const setMetronomeSound = (payload: string): SetMetronomeSoundAction => {
  return { type: EXCLUSIVE.SET_METRONOME_SOUND, payload };
};

export const setBPM = (payload: number): SetBPMAction => {
  return { type: SHARED.SET_BPM, payload };
};

export const setBeatsPerBar = (payload: number): SetBeatsPerBarAction => {
  return { type: SHARED.SET_BEATS_PER_BAR, payload };
};

export type SharedActionTypes = SetBPMAction | SetBeatsPerBarAction;

/**
 * Single exported type for use in other modules.
 */
export type ExclusiveActionTypes = SetPlayingAction | SetMetronomeSoundAction;
