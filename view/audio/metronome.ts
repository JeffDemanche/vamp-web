import { Scheduler } from "./scheduler";
import { Component, ReactNode } from "react";
import { StateType } from "../redux/reducers";
import { connect } from "react-redux";

interface StateProps {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  metronomeSound: string;
  playPosition: number;
  playStartTime: number;
}

interface OwnProps {
  audioContext: AudioContext;
  scheduler: Scheduler;
}

interface MetronomeProps extends StateProps, OwnProps {}

const mapStateToProps = (state: StateType): StateProps => {
  return {
    bpm: state.workspace.bpm,
    beatsPerBar: state.workspace.beatsPerBar,
    playing: state.workspace.playing,
    metronomeSound: state.workspace.metronomeSound,
    playPosition: state.workspace.playPosition,
    playStartTime: state.workspace.playStartTime
  };
};

/**
 * Handles metronome things. Created in WorkspaceAudio.
 */
class ConnectedMetronome extends Component<MetronomeProps> {
  private _scheduler: Scheduler;

  constructor(props: MetronomeProps) {
    super(props);
  }

  componentDidUpdate(prevProps: MetronomeProps): void {
    if (this.props.playing && !prevProps.playing) {
      this.play();
    }
    if (
      this.props.bpm != prevProps.bpm ||
      this.props.beatsPerBar != prevProps.beatsPerBar
    ) {
      this.setEvent();
    }
  }

  render(): ReactNode {
    return null;
  }

  private play = async (): Promise<void> => {
    this.setEvent();
  };

  private setEvent = (): void => {
    this.props.scheduler.addEvent({
      id: "METRONOME",
      start: 0,
      dispatch: async (
        context: AudioContext,
        scheduler: Scheduler
      ): Promise<void> => {
        if (this.props.playing) {
          this.tick(context);
        }
      },
      repeat: this.timeBetweenTicks()
    });
  };

  private timeBetweenTicks = (): number => 1.0 / (this.props.bpm / 60);

  private tick = (context: AudioContext): void => {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.connect(context.destination);
    osc.start(0);
    osc.stop(context.currentTime + 0.05);
  };
}

const Metronome = connect(mapStateToProps)(ConnectedMetronome);

export default Metronome;
