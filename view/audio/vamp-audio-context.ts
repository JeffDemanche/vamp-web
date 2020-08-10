/**
 * Wrapper class for the AudioContext
 */
class VampAudioContext {
  private _context: AudioContext;

  //TODO error handling
  constructor() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    this._context = context;
  }

  getAudioContext = (): AudioContext => this._context;
}

// eslint-disable-next-line prefer-const
export let vampAudioContext = new VampAudioContext();
