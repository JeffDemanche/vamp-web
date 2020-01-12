import * as React from "react";

import { setPlaying } from "../../../redux/actions/workspace";

import { StateType } from "../../../redux/reducers/index";
import { WorkspaceActionTypes } from "../../../redux/actions/workspace";

const { connect } = require("react-redux");
const styles = require("./play-stop-button.less");

const mapStateToProps = (state: StateType) => {
  return { playing: state.workspace.playing };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setPlaying: (playing: boolean) => dispatch(setPlaying(playing))
  };
};

const handleClick = (
  playing: boolean,
  setPlaying: (payload: boolean) => WorkspaceActionTypes
) => {
  setPlaying(!playing);
};

const ConnectedPlayStopButton = ({
  playing,
  setPlaying
}: {
  playing: boolean;
  setPlaying: (payload: boolean) => WorkspaceActionTypes;
}) => {
  const image = playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");
  return (
    <div
      className={styles["play-stop-button"]}
      onClick={e => handleClick(playing, setPlaying)}
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
