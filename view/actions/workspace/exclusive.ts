import { EXCLUSIVE } from "../../constants/action-types";

interface SetPlayingAction {
  type: typeof EXCLUSIVE.SET_PLAYING
  payload: boolean
}

export const setPlaying = (payload: boolean) => {
  return { type: EXCLUSIVE.SET_PLAYING, payload };
};


/**
 * Single exported type for use in other modules.
 */
export type ExclusiveActionTypes = SetPlayingAction