import { WORKSPACE } from "../action-types";
import { WorkspaceActionTypes } from "../actions/workspace";

const initialWorkspaceState: WorkspaceType = {
  bpm: 120,
  beatsPerBar: 4,
  playing: false,
  metronomeSound: "Hi-Hat"
};

export interface WorkspaceType {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  metronomeSound: string;
}

export const workspace = (
  state = initialWorkspaceState,
  action: WorkspaceActionTypes
): WorkspaceType => {
  switch (action.type) {
    case WORKSPACE.SET_BPM:
      return { bpm: action.payload, ...state };
    case WORKSPACE.SET_BEATS_PER_BAR:
      return { beatsPerBar: action.payload, ...state };
    case WORKSPACE.SET_PLAYING:
      return {
        playing: action.payload,
        ...state
      };
    case WORKSPACE.SET_METRONOME_SOUND:
      return { metronomeSound: action.payload, ...state };
    default:
      return state;
  }
};
