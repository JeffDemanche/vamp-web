import * as React from "react";

import {
  setBPM,
  WorkspaceActionTypes,
  SetBPMAction
} from "../../../redux/actions/workspace";

import { StateType } from "../../../redux/reducers/index";
import { SettingNumeric } from "../../element/setting-numeric";

import { connect } from "react-redux";
import { Dispatch } from "redux";

interface StateProps {
  bpm: number;
}

interface DispatchProps {
  setBPM: (bpm: number) => SetBPMAction;
}

const mapStateToProps = (state: StateType): StateProps => {
  return { bpm: state.workspace.bpm };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setBPM: (bpm: number): SetBPMAction => dispatch(setBPM(bpm))
  };
};

const ConnectedBPMSetting = ({
  bpm,
  setBPM
}: {
  bpm: number;
  setBPM: (payload: number) => WorkspaceActionTypes;
}): JSX.Element => {
  return (
    <SettingNumeric
      value={bpm}
      integer={true}
      minValue={1}
      maxValue={499}
      text="BPM"
      reduxDispatch={setBPM}
    ></SettingNumeric>
  );
};

export const BPMSetting = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedBPMSetting);
