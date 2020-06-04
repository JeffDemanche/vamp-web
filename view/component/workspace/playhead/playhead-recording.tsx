import * as React from "react";

import styles = require("./playhead.less");
import { useState, useEffect } from "react";
import { graphql, ChildProps } from "react-apollo";
import { gql } from "apollo-boost";
import { ViewState } from "../../../state/cache";

interface PlayheadRecordingData {
  playing: boolean;
  playPosition: number;
  playStartTime: number;
  recording: boolean;
  viewState: ViewState;
}

const ConnectedPlayheadRecording = ({
  data: { playing, playPosition, playStartTime, recording, viewState }
}: ChildProps<{}, PlayheadRecordingData>): JSX.Element => {
  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const [trueTime, setTrueTime] = useState(playPosition);

  useEffect(() => {
    let interval: NodeJS.Timeout = null;
    if (playing) {
      interval = global.setInterval(() => {
        setTrueTime(playPosition + (Date.now() - playStartTime) / 1000);
      }, 200);
    } else {
      clearInterval(interval);
      setTrueTime(playPosition);
    }
    return (): void => clearInterval(interval);
  }, [playing]);

  const width = `${100 * trueTime * viewState.temporalZoom}px`;

  return <div style={{ width }} className={styles["playhead-recording"]}></div>;
};

const PLAYHEAD_RECORDING_QUERY = gql`
  query PlayheadRecording {
    playing @client
    playPosition @client
    playStartTime @client
    recording @client
    viewState @client {
      temporalZoom
    }
  }
`;

const PlayheadRecording = graphql<{}, PlayheadRecordingData>(
  PLAYHEAD_RECORDING_QUERY
)(ConnectedPlayheadRecording);

export { PlayheadRecording };
