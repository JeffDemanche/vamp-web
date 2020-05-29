/**
 * The initialization for the Apollo state management. This is accomplishing the
 * same thing we could with Redux, but is way better integrated for updating
 * from the server.
 */

export interface ApolloWorkspaceType {
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
}

export const initialCache: ApolloWorkspaceType = {
  id: "",

  bpm: 120,
  beatsPerBar: 4,
  playing: false,
  metronomeSound: "Hi-Hat",

  playPosition: 0,
  playStartTime: -1
};
