import * as React from "react";

import {
  setBeatsPerBar,
  SetBeatsPerBarAction
} from "../../../actions/workspace/workspace";

import { StateType } from "../../../reducers/index";
import { SettingNumeric } from "../../element/setting-numeric";

import { connect } from "react-redux";
import { Dispatch } from "redux";

interface StateProps {
  beatsPerBar: number;
}

interface DispatchProps {
  setBeatsPerBar: (beatsPerBar: number) => SetBeatsPerBarAction;
}

interface BeatsPerBarSettingProps extends DispatchProps, StateProps {}

const mapStateToProps = (state: StateType): StateProps => {
  return { beatsPerBar: state.workspace.shared.beatsPerBar };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setBeatsPerBar: (beatsPerBar: number): SetBeatsPerBarAction =>
      dispatch(setBeatsPerBar(beatsPerBar))
  };
};

const ConnectedBeatsPerBarSetting = ({
  beatsPerBar,
  setBeatsPerBar
}: BeatsPerBarSettingProps): JSX.Element => {
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
