import * as React from "react";

import { connect } from "react-redux";
import { setPlaying, SetPlayingAction } from "../../../redux/actions/workspace";

import styles = require("./clip.less");

import { StateType } from "../../../redux/reducers/index";
import { WorkspaceActionTypes } from "../../../redux/actions/workspace";
import { Dispatch } from "redux";

interface StateProps {
  playing: boolean;
}

interface DispatchProps {
  setPlaying: (playing: boolean) => SetPlayingAction;
}

interface ClipSettingProps extends StateProps, DispatchProps {}

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

const ConnectedClip: React.FunctionComponent<ClipSettingProps> = ({
  playing,
  setPlaying
}: ClipSettingProps) => {
  return (
    <div
      className={styles["clip"]}
      onClick={(): void => {
        handleClick(playing, setPlaying);
      }}
    >
      <img src={require("../../../img/vector/record.svg")} />
    </div>
  );
};

const Clip = connect(mapStateToProps, mapDispatchToProps)(ConnectedClip);

export { Clip };
