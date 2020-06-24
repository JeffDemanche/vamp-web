import * as React from "react";

import * as styles from "./cab.less";
import { useState, useEffect } from "react";
import { graphql, ChildProps } from "react-apollo";
import { gql } from "apollo-boost";
import { ViewState } from "../../../state/cache";
import { useTrueTime } from "../../../react-hooks";

interface CabRecordingData {
  start: number;
  end: number;
  playing: boolean;
  playPosition: number;
  playStartTime: number;
  recording: boolean;
  viewState: ViewState;
}

const ConnectedCabRecording = ({
  data: {
    start,
    end,
    playing,
    playPosition,
    playStartTime,
    recording,
    viewState
  }
}: ChildProps<{}, CabRecordingData>): JSX.Element => {
  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const trueTime = useTrueTime(
    playing,
    playPosition,
    playStartTime,
    start,
    end,
    200
  );

  const width = `${100 * trueTime * viewState.temporalZoom}px`;

  return <div style={{ width }} className={styles["cab-recording"]}></div>;
};

const CAB_RECORDING_QUERY = gql`
  query CabRecording {
    start @client
    end @client
    playing @client
    playPosition @client
    playStartTime @client
    recording @client
    viewState @client {
      temporalZoom @client
    }
  }
`;

const CabRecording = graphql<{}, CabRecordingData>(CAB_RECORDING_QUERY)(
  ConnectedCabRecording
);

export { CabRecording };
