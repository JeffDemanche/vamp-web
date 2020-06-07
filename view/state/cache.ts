/**
 * The initialization for the Apollo local state management. This is
 * accomplishing the same thing we could with Redux, but is way better
 * integrated for updating from the server.
 */

export interface Clip {
  __typename: string;
  id: string;
  audio: Audio;
}

export interface Audio {
  __typename: string;
  id: string;
  filename: string;
  storedLocally: boolean;
  // uploader: User;
  duration: number;
}

export interface Me {
  __typename: string;
  id: string;
  username: string;
  email: string;
}

export interface ViewState {
  __typename: string;

  /**
   * Seconds per 100 horizontal pixels.
   */
  temporalZoom: number;
}

export interface ApolloWorkspaceType {
  me: Me;
  audios: Audio[];

  id: string;

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

  recording: boolean;

  clips: Clip[];

  viewState: ViewState;
}

export const initialCache: ApolloWorkspaceType = {
  me: null,
  audios: [],

  id: "",

  bpm: 120,
  beatsPerBar: 4,
  playing: false,
  metronomeSound: "Hi-Hat",

  playPosition: 0,
  playStartTime: -1,

  recording: false,

  clips: [],

  viewState: {
    __typename: "ViewState",
    temporalZoom: 1
  }
};
