import * as React from "react";

import { connect } from "react-redux";
import {
  play,
  pause,
  stop,
  PlayAction,
  PauseAction,
  StopAction
} from "../../../redux/actions/workspace";

import styles = require("./playhead.less");

import { StateType } from "../../../redux/reducers/index";
import { Dispatch } from "redux";

interface StateProps {
  playing: boolean;
}

interface DispatchProps {
  play: () => PlayAction;
  pause: () => PauseAction;
  stop: () => StopAction;
}

interface PlayheadNewProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: StateType): StateProps => {
  return { playing: state.workspace.playing };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    play: (): PlayAction => dispatch(play()),
    pause: (): PauseAction => dispatch(pause()),
    stop: (): StopAction => dispatch(stop())
  };
};

const handleClick = (
  playing: boolean,
  play: () => PlayAction,
  pause: () => PauseAction,
  stop: () => StopAction
): void => {
  if (playing) {
    stop();
  } else {
    play();
  }
};

const ConnectedPlayheadNew: React.FunctionComponent<PlayheadNewProps> = ({
  playing,
  play,
  pause,
  stop
}: PlayheadNewProps) => {
  return (
    <div
      className={styles["playhead-new"]}
      onClick={(): void => {
        handleClick(playing, play, pause, stop);
      }}
    >
      <img src={require("../../../img/vector/record.svg")} />
    </div>
  );
};

const PlayheadNew = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedPlayheadNew);

export { PlayheadNew };
