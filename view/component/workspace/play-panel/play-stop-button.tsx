import * as React from "react";

import { setPlaying, SetPlayingAction } from "../../../redux/actions/workspace";

import { StateType } from "../../../redux/reducers/index";
import { WorkspaceActionTypes } from "../../../redux/actions/workspace";

import { connect } from "react-redux";
import styles = require("./play-stop-button.less");
import { Dispatch } from "redux";

interface StateProps {
  playing: boolean;
}

interface DispatchProps {
  setPlaying: (playing: boolean) => SetPlayingAction;
}

interface PlayStopButtonProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: StateType): StateProps => {
  return { playing: state.workspace.playing };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setPlaying: (playing: boolean): SetPlayingAction =>
      dispatch(setPlaying(playing))
  };
};

const handleClick = (
  playing: boolean,
  setPlaying: (payload: boolean) => WorkspaceActionTypes
): void => {
  setPlaying(!playing);
};

const ConnectedPlayStopButton: React.FunctionComponent<PlayStopButtonProps> = ({
  playing,
  setPlaying
}: PlayStopButtonProps) => {
  const image = playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");
  return (
    <div
      className={styles["play-stop-button"]}
      onClick={(): void => handleClick(playing, setPlaying)}
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
