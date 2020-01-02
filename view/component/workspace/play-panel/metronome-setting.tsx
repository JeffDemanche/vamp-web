import * as React from "react";

import {
  setMetronomeSound,
  ExclusiveActionTypes
} from "../../../actions/workspace/workspace";

import { StateType } from "../../../reducers/index";
import { SettingSelect } from "../../input/setting-select";

const { connect } = require("react-redux");

const mapStateToProps = (state: StateType) => {
  return { metronomeSound: state.workspace.exclusive.metronomeSound };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setMetronomeSound: (metronomeSound: string) =>
      dispatch(setMetronomeSound(metronomeSound))
  };
};

const ConnectedMetronomeSetting = ({
  metronomeSound,
  setMetronomeSound
}: {
  metronomeSound: string;
  setMetronomeSound: (payload: string) => ExclusiveActionTypes;
}) => {
  return (
    <SettingSelect
      value={metronomeSound}
      options={[{ index: 1, value: "Hi-Hat" }, { index: 2, value: "Beep" }]}
      reduxDispatch={setMetronomeSound}
    ></SettingSelect>
  );
};

export const MetronomeSetting = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedMetronomeSetting);
