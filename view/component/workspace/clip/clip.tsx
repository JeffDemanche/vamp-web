import * as React from "react";

const { connect } = require("react-redux");
import { setPlaying } from "../../../redux/actions/workspace";

const styles = require("./clip.less");

import { StateType } from "../../../redux/reducers/index";
import { WorkspaceActionTypes } from "../../../redux/actions/workspace";

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

const ConenctedClip = ({
  playing,
  setPlaying
}: {
  playing: boolean;
  setPlaying: (payload: boolean) => WorkspaceActionTypes;
}) => {
  return (
    <div
      className={styles["clip"]}
      onClick={e => {
        handleClick(playing, setPlaying);
      }}
    >
      <img src={require("../../../img/vector/record.svg")} />
    </div>
  );
};

const Clip = connect(mapStateToProps, mapDispatchToProps)(ConenctedClip);

export { Clip };
