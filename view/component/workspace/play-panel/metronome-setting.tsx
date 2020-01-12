import * as React from "react";

import {
  setMetronomeSound,
  WorkspaceActionTypes,
  SetMetronomeSoundAction
} from "../../../redux/actions/workspace";

import { StateType } from "../../../redux/reducers/index";
import { SettingSelect } from "../../element/setting-select";

import { connect } from "react-redux";
import { Dispatch } from "redux";

interface StateProps {
  metronomeSound: string;
}

interface DispatchProps {
  setMetronomeSound: (metronomeSound: string) => SetMetronomeSoundAction;
}

const mapStateToProps = (state: StateType): StateProps => {
  return { metronomeSound: state.workspace.metronomeSound };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    setMetronomeSound: (metronomeSound: string): SetMetronomeSoundAction =>
      dispatch(setMetronomeSound(metronomeSound))
  };
};

const ConnectedMetronomeSetting = ({
  metronomeSound,
  setMetronomeSound
}: {
  metronomeSound: string;
  setMetronomeSound: (payload: string) => WorkspaceActionTypes;
}): JSX.Element => {
  return (
    <SettingSelect
      value={metronomeSound}
      options={[
        { index: 1, value: "Hi-Hat" },
        { index: 2, value: "Beep" }
      ]}
      reduxDispatch={setMetronomeSound}
    ></SettingSelect>
  );
};

export const MetronomeSetting = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedMetronomeSetting);
