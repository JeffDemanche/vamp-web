import { WORKSPACE } from "../action-types";
import { Reducer } from "redux";

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

export const workspace: Reducer<WorkspaceType> = (
  state = initialWorkspaceState,
  action
) => {
  switch (action.type) {
    case WORKSPACE.SET_BPM:
      return { ...state, bpm: action.payload };
    case WORKSPACE.SET_BEATS_PER_BAR:
      return { ...state, beatsPerBar: action.payload };
    case WORKSPACE.SET_PLAYING:
      return {
        ...state,
        playing: action.payload
      };
    case WORKSPACE.SET_METRONOME_SOUND:
      return { ...state, metronomeSound: action.payload };
    default:
      return state;
  }
};
