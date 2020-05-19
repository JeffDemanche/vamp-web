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

/**
 * Redux action to set the workspace playing state.
 * @param payload True/false if playing.
 * @param triggerAudio If true, this action will trigger the WorkspaceAudio to
 *     start playing on this state change. The only reason this should be false
 *     is if the action is being dispatched from the WorkspaceAudio (for
 *     instance, if there's a recording error we would want to notify the view
 *     components to stop playing but don't want to notify the WorkspaceAudio
 *     because it already knows).
 */
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
