/**
 * Root of all audio-interface-related code. I'm thinking taking a stab at
 * making this object-oriented might be a good first-attempt.
 */

import { Scheduler } from "./scheduler";
import store from "../redux/store/index";
import { WorkspaceType } from "../redux/reducers/workspace";
import Metronome from "./metronome";
import Recorder from "./recorder";
import { setPlaying, SetPlayingAction } from "../redux/actions/workspace";
import * as React from "react";
import { StateType } from "../redux/reducers";
import { Dispatch } from "redux";
import { connect } from "react-redux";

interface StateProps {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  metronomeSound: string;
  playPosition: number;
  playStartTime: number;
}

interface DispatchProps {
  setPlaying: (playing: boolean) => SetPlayingAction;
}

interface WorkspaceAudioProps extends StateProps, DispatchProps {}

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

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setPlaying: (playing: boolean): SetPlayingAction =>
      dispatch(setPlaying(playing))
  };
};

/**
 * This is a renderless component that's included in the ViewWorkspace and
 * interacts with the Redux store to perform audio tasks for the Vamp app. It
 * being a component is advantageous because it allows us to sync all audio
 * functionality directly with the store. So if the user presses the play
 * button, for instance, Redux will send that state update here free of charge
 * and we won't have to worry about keeping track of that change otherwise. If
 * we then wanted to add another way of playing audio, it'll be as simple as
 * calling the Redux action from a new point in the app.
 */
class ConnectedWorkspaceAudio extends React.Component<WorkspaceAudioProps> {
  _context: AudioContext;
  _scheduler: Scheduler;
  _recorder: Recorder;

  constructor(props: WorkspaceAudioProps) {
    super(props);
  }

  /**
   * Called when the component is loaded, which should be whenever the
   * ViewWorkspace is loaded.
   */
  componentDidMount(): void {
    this._context = this.startAudioContext();
    this._scheduler = new Scheduler(this._context);
    this._recorder = new Recorder(this._context);
  }

  /**
   * This hook is called when any of the state properties in StateProps above
   * are changed in the Redux store from anywhere in the app. The WorkspaceAudio
   * component performs audio-engine tasks such as playing, stopping, recording,
   * etc. based on these changes.
   * @param prevProps The StateProps state before the change occured.
   */
  componentDidUpdate(prevProps: WorkspaceAudioProps): void {
    if (this.props.playing && !prevProps.playing) {
      this.play();
    }
    if (!this.props.playing && prevProps.playing) {
      this.stop();
    }
  }

  render(): React.ReactNode {
    return (
      <>
        <Metronome scheduler={this.scheduler}></Metronome>
      </>
    );
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
   * Called when state change triggers the audio to play.
   */
  play(): void {
    if (this._recorder.startRecording()) {
      this.scheduler.play();
    } else {
      // TODO Give a user-facing warning about microphone access.
      console.error("No microhpone access granted.");
      this.props.setPlaying(false);
    }
  }

  /**
   * Called when the state change triggers the audio to stop.
   */
  stop(): void {
    if (this._recorder.stopRecording()) {
      this.scheduler.stop();
    } else {
      // TODO User-facing warning.
      console.error(
        "Tried to stop stream recording but recorder was undefined."
      );
      this.props.setPlaying(false);
    }
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

  beginRecord(): void {}
}

const WorkspaceAudio = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedWorkspaceAudio);

export { WorkspaceAudio };
