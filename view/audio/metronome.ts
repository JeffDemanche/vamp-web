import { WorkspaceType } from "../redux/reducers/workspace";

/**
 * Handles metronome things. Created in WorkspaceAudio.
 */
class Metronome {
  private _bpm: number;
  private _beatsPerBar: number;
  private _metronomeSound: string;

  constructor(workspaceState: WorkspaceType) {
    this._bpm = workspaceState.bpm;
    this._beatsPerBar = workspaceState.beatsPerBar;
    this._metronomeSound = workspaceState.metronomeSound;
  }

  set bpm(bpm: number) {
    this._bpm = bpm;
  }

  set beatsPerBar(beatsPerBar: number) {
    this._beatsPerBar = beatsPerBar;
  }

  set metronomeSound(metronomeSound: string) {
    this._metronomeSound = metronomeSound;
  }
}

export default Metronome;
