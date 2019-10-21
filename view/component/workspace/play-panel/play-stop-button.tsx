import * as React from "react";

import { setPlaying } from "../../../actions/workspace/exclusive";

import { StateType } from "../../../reducers/index";
import { ExclusiveActionTypes } from "../../../actions/workspace/exclusive";

const { connect } = require("react-redux");
const styles = require("./play-stop-button.less");

const mapStateToProps = (state: StateType) => {
  return { playing: state.workspace.exclusive.playing };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setPlaying: (playing: boolean) => dispatch(setPlaying(playing))
  };
};

const handleClick = (
  playing: boolean,
  setPlaying: (payload: boolean) => ExclusiveActionTypes
) => {
  setPlaying(!playing);
};

const ConnectedPlayStopButton = ({
  playing,
  setPlaying
}: {
  playing: boolean;
  setPlaying: (payload: boolean) => ExclusiveActionTypes;
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
