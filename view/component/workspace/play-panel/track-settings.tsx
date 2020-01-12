import * as React from "react";

const { connect } = require("redux");
const styles = require("./track-settings.less");
import { StateType } from "../../../redux/reducers/index";

const mapStateToProps = (state: StateType) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

const ConnectedTrackSettings = () => {
  return (
    <div className={styles["track-settings"]}>
      <p>120 BPM</p>
      <p>4 / Bar</p>
      <p>Hi-Hat</p>
    </div>
  );
};

const TrackSettings = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedTrackSettings);

export { TrackSettings };
