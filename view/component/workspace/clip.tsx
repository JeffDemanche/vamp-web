import * as React from "react";

const { connect } = require("react-redux");
import { setPlaying } from "../../actions/workspace/exclusive";

const styles = require("./clip.less");

import { StateType } from "../../reducers/index";
import { ExclusiveActionTypes } from "../../actions/workspace/exclusive";

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

const ConenctedClip = ({
  playing,
  setPlaying
}: {
  playing: boolean;
  setPlaying: (payload: boolean) => ExclusiveActionTypes;
}) => {
  return (
    <div
      className={styles["clip"]}
      onClick={e => {
        handleClick(playing, setPlaying);
      }}
    >
      <img src="../../img/vector/record.svg" />
    </div>
  );
};

const Clip = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConenctedClip);

export { Clip };
