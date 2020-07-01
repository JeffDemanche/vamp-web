import * as React from "react";
import { graphql, ChildProps, useQuery } from "react-apollo";

import * as styles from "./timecode.less";
import { gql } from "apollo-boost";
import { useTrueTime, useCurrentVampId } from "../../../react-hooks";
import { TimecodeClient } from "../../../state/apollotypes";

const TIMECODE_CLIENT = gql`
  query TimecodeClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      playing @client
      playPosition @client
      playStartTime @client
      start @client
      end @client
    }
  }
`;

const Timecode = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: { start, end, playing, playPosition, playStartTime }
    }
  } = useQuery<TimecodeClient>(TIMECODE_CLIENT, { variables: { vampId } });

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

export default Timecode;
