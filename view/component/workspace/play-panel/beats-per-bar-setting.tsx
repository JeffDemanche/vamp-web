import * as React from "react";

import {
  setBeatsPerBar,
  SharedActionTypes
} from "../../../actions/workspace/workspace";

import { StateType } from "../../../reducers/index";
import { SettingNumeric } from "../../input/setting-numeric";

const { connect } = require("react-redux");

const mapStateToProps = (state: StateType) => {
  return { beatsPerBar: state.workspace.shared.beatsPerBar };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setBeatsPerBar: (beatsPerBar: number) =>
      dispatch(setBeatsPerBar(beatsPerBar))
  };
};

const ConnectedBeatsPerBarSetting = ({
  beatsPerBar,
  setBeatsPerBar
}: {
  beatsPerBar: number;
  setBeatsPerBar: (payload: number) => SharedActionTypes;
}) => {
  return (
    <SettingNumeric
      value={beatsPerBar}
      integer={true}
      minValue={1}
      maxValue={499}
      text="/ Bar"
      reduxDispatch={setBeatsPerBar}
    ></SettingNumeric>
  );
};

export const BeatsPerBarSetting = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedBeatsPerBarSetting);
