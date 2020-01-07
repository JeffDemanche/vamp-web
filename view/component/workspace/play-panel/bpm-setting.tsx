import * as React from "react";

import {
  setBPM,
  SharedActionTypes,
  SetBPMAction
} from "../../../actions/workspace/workspace";

import { StateType } from "../../../reducers/index";
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
  return { bpm: state.workspace.shared.bpm };
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
  setBPM: (payload: number) => SharedActionTypes;
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
