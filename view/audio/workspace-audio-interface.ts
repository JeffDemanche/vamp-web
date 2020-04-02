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
      getWorkspaceAudio()
        .getMusic()
        .play();
    } else {
      getWorkspaceAudio()
        .getMusic()
        .stop();
    }
  }
};

export default audioInterface;
