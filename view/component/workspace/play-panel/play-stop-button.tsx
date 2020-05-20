import * as React from "react";

import {
  play,
  pause,
  stop,
  PlayAction,
  PauseAction,
  StopAction
} from "../../../redux/actions/workspace";

import { StateType } from "../../../redux/reducers/index";

import { connect } from "react-redux";
import styles = require("./play-stop-button.less");
import { Dispatch } from "redux";

interface StateProps {
  playing: boolean;
}

interface DispatchProps {
  play: () => PlayAction;
  pause: () => PauseAction;
  stop: () => StopAction;
}

interface PlayStopButtonProps extends StateProps, DispatchProps {}

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

const ConnectedPlayStopButton: React.FunctionComponent<PlayStopButtonProps> = ({
  playing,
  play,
  pause,
  stop
}: PlayStopButtonProps) => {
  const image = playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");
  return (
    <div
      className={styles["play-stop-button"]}
      onClick={(): void => handleClick(playing, play, pause, stop)}
    >
      <img src={image} />
    </div>
  );
};

const PlayStopButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedPlayStopButton);

export { PlayStopButton };
