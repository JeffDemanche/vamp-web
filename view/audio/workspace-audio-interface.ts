/**
 * Connects the audio scripts in this folder with the Redux state/Apollo stuff.
 */

import { getWorkspaceAudio } from "./vamp-audio";

/**
 * Describes all the interactions from Redux actions to the vamp audio endpoint.
 */
const audioInterface = {
  setPlaying: (val: boolean): void => {
    if (val) {
      getWorkspaceAudio().play();
    } else {
      getWorkspaceAudio().stop();
    }
  },
  setBPM: (val: number): void => {
    getWorkspaceAudio().metronome.bpm = val;
  },
  setBeatsPerBar: (val: number): void => {
    getWorkspaceAudio().metronome.beatsPerBar = val;
  },
  setMetronomeSound: (val: string): void => {
    getWorkspaceAudio().metronome.metronomeSound = val;
  }
};

export default audioInterface;
