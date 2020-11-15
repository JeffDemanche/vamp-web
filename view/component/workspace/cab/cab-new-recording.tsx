import * as React from "react";

import * as styles from "./cab.less";
import { useTrueTime } from "../../../react-hooks";
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import { useWorkspaceWidth } from "../../../workspace-hooks";

/*
 * CabNew becomes CabNewRecording when it starts recording.
 */
const CabNewRecording = (): JSX.Element => {
  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const trueTime = useTrueTime(200);

  const widthFn = useWorkspaceWidth();
  const width = widthFn(trueTime);

  return (
    <div
      style={{ width: `${width}px` }}
      className={styles["cab-new-recording"]}
    >
      <Oscilloscope
        dimensions={{
          width: width
        }}
      ></Oscilloscope>
    </div>
  );
};

export { CabNewRecording };
