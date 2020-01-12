import { WORKSPACE } from "../action-types";

export interface SetPlayingAction {
  type: typeof WORKSPACE.SET_PLAYING;
  payload: boolean;
}

export interface SetMetronomeSoundAction {
  type: typeof WORKSPACE.SET_METRONOME_SOUND;
  payload: string;
}

export interface SetBPMAction {
  type: typeof WORKSPACE.SET_BPM;
  payload: number;
}

export interface SetBeatsPerBarAction {
  type: typeof WORKSPACE.SET_BEATS_PER_BAR;
  payload: number;
}

export const setPlaying = (payload: boolean): SetPlayingAction => {
  return { type: WORKSPACE.SET_PLAYING, payload };
};

export const setMetronomeSound = (payload: string): SetMetronomeSoundAction => {
  return { type: WORKSPACE.SET_METRONOME_SOUND, payload };
};

export const setBPM = (payload: number): SetBPMAction => {
  return { type: WORKSPACE.SET_BPM, payload };
};

export const setBeatsPerBar = (payload: number): SetBeatsPerBarAction => {
  return { type: WORKSPACE.SET_BEATS_PER_BAR, payload };
};

/**
 * Single exported type for use in other modules.
 */
export type WorkspaceActionTypes =
  | SetBPMAction
  | SetBeatsPerBarAction
  | SetPlayingAction
  | SetMetronomeSoundAction;
