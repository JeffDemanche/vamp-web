import * as React from "react";

import * as styles from "./timecode.less";
import { useTrueTime } from "../../../react-hooks";

const Timecode = (): JSX.Element => {
  // Gets the current time and updates every 1/100 second. This should be
  // adequate for a 1/100 second precision timer.
  const trueTime = useTrueTime(100);

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
