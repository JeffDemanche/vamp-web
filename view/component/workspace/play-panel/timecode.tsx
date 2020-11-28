import * as React from "react";

import * as styles from "./timecode.less";
import { useTrueTime } from "../../../react-hooks";

/**
 * The counter that displays the time.
 */
const Timecode = (): JSX.Element => {
  // Gets the current time and updates every 1/100 second. This should be
  // adequate for a 1/100 second precision timer.
  const trueTime = useTrueTime(100);

  const sign = trueTime < 0 ? "-" : "";

  const absTrueTime = Math.abs(trueTime);

  // True time is in seconds.
  const minutes = Math.floor(absTrueTime / 60);
  const seconds = Math.floor(absTrueTime % 60);
  const fracs = Math.round(10 * ((absTrueTime % 60) - seconds));

  return (
    <div className={styles["timecode"]}>
      {sign}
      {minutes}:{seconds}.{fracs}
    </div>
  );
};

export default Timecode;
