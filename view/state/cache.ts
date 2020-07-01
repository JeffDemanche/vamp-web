/**
 * The initialization for the Apollo local state management. This is
 * accomplishing the same thing we could with Redux, but is way better
 * integrated for updating from the server.
 */

export interface User {
  __typename: string;

  // Synced with server.
  id: string;
  username: string;
  email: string;
}

export interface Clip {
  __typename?: string;

  // Synced with server.
  id: string;
  start: number;
  audio: Audio;
}

/**
 * A ClientClip should only exist while we're waiting for a clip that we the
 * client recorded to be returned to us via subscription from the server. While
 * that might only take a second, waiting would prevent us from smoothly
 * looping.
 */
export interface ClientClip {
  __typename?: string;
  id: string;
  start: number;
  tempFilename: string;
  duration: number;
  storedLocally: boolean;
}

export interface Audio {
  __typename?: string;

  // Synced with server.
  id: string;
  filename: string;
  uploader: User;

  // Local only.
  tempFilename: string;

  /**
   * Designed to be true iff the clip has audio stored, be it synced with the
   * server or straight from record.
   */
  storedLocally: boolean;
  duration: number;
}

export type Me = User;

export interface ViewState {
  __typename: string;

  /**
   * Seconds per 100 horizontal pixels.
   */
  temporalZoom: number;
}

export interface ApolloWorkspaceType {
  me: Me;

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

  start: number;
  end: number;
  loop: boolean;

  recording: boolean;

  clips: Clip[];
  clientClips: ClientClip[];

  viewState: ViewState;
}

export const initialCache: ApolloWorkspaceType = {
  me: null,

  id: "",

  bpm: 120,
  beatsPerBar: 4,
  playing: false,
  metronomeSound: "Hi-Hat",

  playPosition: 0,
  playStartTime: -1,

  start: 0,
  end: 0,
  loop: true,

  recording: false,

  clips: [],
  clientClips: [],

  viewState: {
    __typename: "ViewState",
    temporalZoom: 1
  }
};
