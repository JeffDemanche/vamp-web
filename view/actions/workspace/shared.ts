import { SHARED } from "../../constants/action-types";

interface SetBPMAction {
  type: typeof SHARED.SET_BPM;
  payload: number;
}

interface SetBeatsPerBarAction {
  type: typeof SHARED.SET_BEATS_PER_BAR;
  payload: number;
}

export const setBPM = (payload: number) => {
  return { type: SHARED.SET_BPM, payload };
};

export const setBeatsPerBar = (payload: number) => {
  return { type: SHARED.SET_BEATS_PER_BAR, payload };
};


export type SharedActionTypes =
  | SetBPMAction
  | SetBeatsPerBarAction;
