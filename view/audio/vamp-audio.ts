/**
 * Root of all audio-interface-related code. I'm thinking taking a stab at
 * making this object-oriented might be a good first-attempt.
 */

import { Music, workspaceMusic } from "./music";

class WorkspaceAudio {
  context: AudioContext;
  music: Music;

  constructor() {
    this.context = this.startAudioContext();
    this.music = workspaceMusic;
  }

  private startAudioContext(): AudioContext {
    try {
      // Typing for window augmented in externals.d.ts.
      // The webkit thing is Safari bullshit.
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      return new AudioContext();
    } catch (e) {
      // TODO error handling.
      alert("Web audio not supported in this browser (TODO)");
    }
  }

  getMusic(): Music {
    return this.music;
  }

  beginRecord(): void {}
}

let workspaceAudioInstance: WorkspaceAudio;

const initializeWorkspaceAudio = (): void => {
  if (!workspaceAudioInstance) workspaceAudioInstance = new WorkspaceAudio();
};

const getWorkspaceAudio = (): WorkspaceAudio => workspaceAudioInstance;

export { initializeWorkspaceAudio, getWorkspaceAudio };
