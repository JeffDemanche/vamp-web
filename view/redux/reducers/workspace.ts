import { WORKSPACE } from "../action-types";
import { Reducer } from "redux";

const initialWorkspaceState: WorkspaceType = {
  bpm: 120,
  beatsPerBar: 4,
  playing: false,
  metronomeSound: "Hi-Hat",

  playPosition: 0,
  playStartTime: -1
};

export interface WorkspaceType {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  metronomeSound: string;

  /**
   * The position in seconds of the current position before play was pressed.
   */
  playPosition: number;

  /**
   * The Date.now() value of the instant when playing began, or -1 if not
   * playing. The true current time when playing will be playPosition +
   * (Date.now() - playStartTime) / 1000.
   */
  playStartTime: number;
}

export const workspace: Reducer<WorkspaceType> = (
  state = initialWorkspaceState,
  action
) => {
  switch (action.type) {
    case WORKSPACE.SET_BPM:
      return { ...state, bpm: action.payload };
    case WORKSPACE.SET_BEATS_PER_BAR:
      return { ...state, beatsPerBar: action.payload };
    case WORKSPACE.PLAY:
      return {
        ...state,
        playing: true,
        playStartTime: Date.now()
      };
    case WORKSPACE.PAUSE:
      return {
        ...state,
        playing: false,
        playPosition:
          state.playPosition + (Date.now() - state.playStartTime) / 1000,
        playStartTime: -1
      };
    case WORKSPACE.STOP:
      return {
        ...state,
        playing: false,
        playPosition: 0,
        playStartTime: -1
      };
    case WORKSPACE.SET_METRONOME_SOUND:
      return { ...state, metronomeSound: action.payload };
    case WORKSPACE.SET_PLAY_POSITION:
      return { ...state, playPosition: action.payload };
    default:
      return state;
  }
};
