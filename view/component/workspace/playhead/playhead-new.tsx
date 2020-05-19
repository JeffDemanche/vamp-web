import * as React from "react";

import { connect } from "react-redux";
import { setPlaying, SetPlayingAction } from "../../../redux/actions/workspace";

import styles = require("./playhead.less");

import { StateType } from "../../../redux/reducers/index";
import { WorkspaceActionTypes } from "../../../redux/actions/workspace";
import { Dispatch } from "redux";

interface StateProps {
  playing: boolean;
}

interface DispatchProps {
  setPlaying: (playing: boolean) => SetPlayingAction;
}

interface PlayheadNewProps extends StateProps, DispatchProps {}

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

const ConnectedPlayheadNew: React.FunctionComponent<PlayheadNewProps> = ({
  playing,
  setPlaying
}: PlayheadNewProps) => {
  return (
    <div
      className={styles["playhead-new"]}
      onClick={(): void => {
        handleClick(playing, setPlaying);
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
