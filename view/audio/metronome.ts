import { WorkspaceType } from "../redux/reducers/workspace";
import { WorkspaceEvent, Scheduler } from "./scheduler";
import { getWorkspaceAudio } from "./vamp-audio";

/**
 * Handles metronome things. Created in WorkspaceAudio.
 */
class Metronome {
  private _bpm: number;
  private _beatsPerBar: number;
  private _metronomeSound: string;

  private _isPlaying: boolean;

  private _workspaceEvent: WorkspaceEvent;

  constructor(workspaceState: WorkspaceType) {
    this._bpm = workspaceState.bpm;
    this._beatsPerBar = workspaceState.beatsPerBar;
    this._metronomeSound = workspaceState.metronomeSound;
    this._isPlaying = false;
  }

  play = async (): Promise<void> => {
    this._isPlaying = true;
    getWorkspaceAudio().scheduler.addEvent({
      id: "METRONOME",
      start: 0,
      dispatch: async (
        context: AudioContext,
        scheduler: Scheduler
      ): Promise<void> => {
        if (this._isPlaying) {
          this.tick(context);
        }
      },
      repeat: this.timeBetweenTicks()
    });
  };

  stop = async (): Promise<void> => {
    this._isPlaying = false;
  };

  private timeBetweenTicks = (): number => 1.0 / (this.bpm / 60);

  private tick = (context: AudioContext): void => {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.connect(context.destination);
    osc.start(0);
    osc.stop(context.currentTime + 0.05);
  };

  set bpm(bpm: number) {
    this._bpm = bpm;
  }

  get bpm(): number {
    return this._bpm;
  }

  set beatsPerBar(beatsPerBar: number) {
    this._beatsPerBar = beatsPerBar;
  }

  get beatsPerBar(): number {
    return this._beatsPerBar;
  }

  set metronomeSound(metronomeSound: string) {
    this._metronomeSound = metronomeSound;
  }

  get metronomeSound(): string {
    return this._metronomeSound;
  }
}

export default Metronome;
