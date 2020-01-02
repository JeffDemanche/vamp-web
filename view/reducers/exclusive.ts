import { EXCLUSIVE } from "../constants/action-types";
import { ExclusiveActionTypes } from "../actions/workspace/workspace";

const initialPrivateState = { playing: false,
  metronomeSound: "Hi-Hat" };

export interface ExclusiveType {
  playing: boolean;
  metronomeSound: string;
}

/**
 * Reducer functions specific to the workspace
 *
 * These are split between "shared" and "private" state objects.
 */
export const exclusive = (
  state = initialPrivateState,
  action: ExclusiveActionTypes
) => {
  switch (action.type) {
    case EXCLUSIVE.SET_PLAYING:
      return {
        ...state,
        playing: action.payload
      };
    case EXCLUSIVE.SET_METRONOME_SOUND:
      return { ...state, metronomeSound: action.payload };
    default:
      return state;
  }
};
