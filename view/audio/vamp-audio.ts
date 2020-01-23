/**
 * Root of all audio-interface-related code. I'm thinking taking a stab at
 * making this object-oriented might be a good first-attempt.
 */

class WorkspaceAudio {
  context: AudioContext;

  constructor() {
    this.context = this.startAudioContext();
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
}

let workspaceAudioInstance: WorkspaceAudio;

const initializeWorkspaceAudio = (): void => {
  if (!workspaceAudioInstance) workspaceAudioInstance = new WorkspaceAudio();
};

const getWorkspaceAudio = (): WorkspaceAudio => workspaceAudioInstance;

export { initializeWorkspaceAudio, getWorkspaceAudio };
