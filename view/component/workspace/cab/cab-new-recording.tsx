import * as React from "react";

import * as styles from "./cab.less";
import { useSchedulerTime } from "../../../util/react-hooks";
import { useWorkspaceWidth } from "../../../util/workspace-hooks";

/*
 * CabNew becomes CabNewRecording when it starts recording.
 */
const CabNewRecording = (): JSX.Element => {
  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const trueTime = useSchedulerTime(200);

  const widthFn = useWorkspaceWidth();
  const width = widthFn(trueTime);

  return (
    <div
      style={{ width: `${width}px` }}
      className={styles["cab-new-recording"]}
    ></div>
  );
};

export { CabNewRecording };
