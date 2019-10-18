import * as React from "react";

import { StateType } from "../../../reducers/index";

const { connect } = require("react-redux");
const styles = require("./play-stop-button.less");

interface PlayStopButtonProps {
  playing: boolean
}

const mapStateToProps = (state: StateType) => {
  return { playing: state.workspace.exclusive.playing };
};

const ConnectedPlayStopButton: React.FC<PlayStopButtonProps> = ({ playing }) => {
  const image = playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");
  return (
    <div className={styles["play-stop-button"]}>
      <img src={image} />
    </div>
  );
};

const PlayStopButton = connect(mapStateToProps)(ConnectedPlayStopButton);

export { PlayStopButton };
