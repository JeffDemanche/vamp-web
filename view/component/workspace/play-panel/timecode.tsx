import * as React from "react";
import { graphql, ChildProps } from "react-apollo";

import * as styles from "./timecode.less";
import { gql } from "apollo-boost";
import { useTrueTime } from "../../../react-hooks";

interface TimecodeData {
  start: number;
  end: number;
  playing: boolean;
  playPosition: number;
  playStartTime: number;
}

const ConnectedTimecode = ({
  data: { start, end, playing, playPosition, playStartTime }
}: ChildProps<{}, TimecodeData>): JSX.Element => {
  // Gets the current time and updates every 1/100 second. This should be
  // adequate for a 1/100 second precision timer.
  const trueTime = useTrueTime(
    playing,
    playPosition,
    playStartTime,
    start,
    end,
    100
  );

  // True time is in seconds.
  const minutes = Math.floor(trueTime / 60);
  const seconds = Math.floor(trueTime % 60);
  const fracs = Math.floor(10 * ((trueTime % 60) - seconds));

  return (
    <div className={styles["timecode"]}>
      {minutes}:{seconds}.{fracs}
    </div>
  );
};

const TIMECODE_QUERY = gql`
  query TimeCodeData {
    playing @client
    playPosition @client
    playStartTime @client
    start @client
    end @client
  }
`;

const Timecode = graphql<{}, TimecodeData>(TIMECODE_QUERY)(ConnectedTimecode);

export default Timecode;
