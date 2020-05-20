import { WORKSPACE } from "../action-types";

export interface PlayAction {
  type: typeof WORKSPACE.PLAY;
}

export interface PauseAction {
  type: typeof WORKSPACE.PAUSE;
}

export interface StopAction {
  type: typeof WORKSPACE.STOP;
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

export interface SetPlayPosition {
  type: typeof WORKSPACE.SET_PLAY_POSITION;
  payload: number;
}

export const play = (): PlayAction => {
  return { type: WORKSPACE.PLAY };
};

export const pause = (): PlayAction => {
  return { type: WORKSPACE.PAUSE };
};

export const stop = (): PlayAction => {
  return { type: WORKSPACE.STOP };
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

export const setPlayPosition = (payload: number): SetPlayPosition => {
  return { type: WORKSPACE.SET_PLAY_POSITION, payload };
};

/**
 * Single exported type for use in other modules.
 */
export type WorkspaceActionTypes =
  | PlayAction
  | PauseAction
  | StopAction
  | SetBPMAction
  | SetBeatsPerBarAction
  | SetMetronomeSoundAction
  | SetPlayPosition;
