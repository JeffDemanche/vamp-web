import * as React from "react";

import { setBPM, SharedActionTypes } from "../../../actions/workspace/workspace";

import { StateType } from "../../../reducers/index";
import { SettingNumeric } from "../../input/setting-numeric";

const { connect } = require("react-redux");

const mapStateToProps = (state: StateType) => {
  return { bpm: state.workspace.shared.bpm };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setBPM: (bpm: number) => {
      dispatch(setBPM(bpm))
    }
  };
};

const ConnectedBPMSetting = ({
  bpm,
  setBPM
}: {
  bpm: number;
  setBPM: (payload: number) => SharedActionTypes;
}) => {
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
