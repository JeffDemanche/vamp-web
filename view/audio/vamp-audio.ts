/**
 * Root of all audio-interface-related code. I'm thinking taking a stab at
 * making this object-oriented might be a good first-attempt.
 */

import { Scheduler } from "./scheduler";
import store from "../redux/store/index";
import { WorkspaceType } from "../redux/reducers/workspace";
import Metronome from "./metronome";

class WorkspaceAudio {
  _context: AudioContext;
  _scheduler: Scheduler;
  _metronome: Metronome;

  constructor() {
    this._context = this.startAudioContext();
    this._scheduler = new Scheduler(this._context);
    this._metronome = new Metronome(this.getWorkspaceState());
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

  /**
   * Triggered from Redux interface.
   */
  play(): void {
    this.scheduler.play();
    this.metronome.play();
  }

  /**
   * Triggered from Redux interface.
   */
  stop(): void {
    this.scheduler.stop();
    this.metronome.stop();
  }

  /**
   * Gets the current state of the workspace, taken directly from the Redux
   * store object.
   */
  getWorkspaceState(): WorkspaceType {
    return store.getState().workspace;
  }

  get scheduler(): Scheduler {
    return this._scheduler;
  }

  get metronome(): Metronome {
    return this._metronome;
  }

  beginRecord(): void {}
}

let workspaceAudioInstance: WorkspaceAudio;

const initializeWorkspaceAudio = (): void => {
  if (!workspaceAudioInstance) workspaceAudioInstance = new WorkspaceAudio();
};

const getWorkspaceAudio = (): WorkspaceAudio => workspaceAudioInstance;

export { initializeWorkspaceAudio, getWorkspaceAudio };
