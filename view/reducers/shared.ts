import { SHARED } from "../constants/action-types";
import { SharedActionTypes } from "../actions/workspace/shared"

const initialSharedState = {
  bpm: 120,
  beatsPerBar: 4,
  metronomeSound: "Hi-Hat"
};

export interface SharedType {
  bpm: number,
  beatsPerBar: number,
  metronomeSound: string
}

export const shared = (state = initialSharedState, action: SharedActionTypes) => {
  switch (action.type) {
    case SHARED.SET_BPM:
      return { ...state, bpm: action.payload };
    case SHARED.SET_BEATS_PER_BAR:
      return { ...state, beatsPerBar: action.payload };
    case SHARED.SET_METRONOME_SOUND:
      return { ...state, metronomeSound: action.payload };
    default:
      return state;
  }
};
