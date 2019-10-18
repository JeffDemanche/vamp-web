import { EXCLUSIVE } from "../constants/action-types";
import { ExclusiveActionTypes } from "../actions/workspace/exclusive"

const initialPrivateState = { playing: false };

export interface ExclusiveType {
  playing: boolean
}

/**
 * Reducer functions specific to the workspace
 *
 * These are split between "shared" and "private" state objects.
 */
export const exclusive = (state = initialPrivateState, action: ExclusiveActionTypes) => {
  switch (action.type) {
    case EXCLUSIVE.SET_PLAYING:
      return {
        ...state,
        playing: action.payload
      };
    default:
      return state;
  }
};
