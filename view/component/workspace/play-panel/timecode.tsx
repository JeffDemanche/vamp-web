import * as React from "react";
import { useState, useEffect } from "react";
import { graphql, ChildProps } from "react-apollo";

import styles = require("./timecode.less");
import { gql } from "apollo-boost";

interface TimecodeData {
  playing: boolean;
  playPosition: number;
  playStartTime: number;
}

const ConnectedTimecode = ({
  data: { playing, playPosition, playStartTime }
}: ChildProps<{}, TimecodeData>): JSX.Element => {
  // This "local state" time is initially set to the playPosition from the
  // Apollo Cache.
  const [trueTime, setTrueTime] = useState(playPosition);

  // The [playing] arg makes it so this hook is called when the playing prop
  // changes. If it is, we begin a timeout interval chain which calculates the
  // correct time every 100ms and sets the trueTime state, which is defined
  // above. If it's not playing, we clear the interval so it stops updating and
  // set the true time to the accurate paused value, given by playPosition from
  // the Redux store.
  useEffect(() => {
    let interval: NodeJS.Timeout = null;
    if (playing) {
      interval = global.setInterval(() => {
        setTrueTime(playPosition + (Date.now() - playStartTime) / 1000);
      }, 100);
    } else {
      clearInterval(interval);
      setTrueTime(playPosition);
    }
    return (): void => clearInterval(interval);
  }, [playing]);

  // In seconds.
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
  }
`;

const Timecode = graphql<{}, TimecodeData>(TIMECODE_QUERY)(ConnectedTimecode);

export default Timecode;
