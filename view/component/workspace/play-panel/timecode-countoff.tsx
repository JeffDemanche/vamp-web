import * as React from "react";
import { useCountOffReverseCounter } from "../../../util/count-off-hooks";
import * as styles from "./timecode-countoff.less";

export const TimecodeCountoff: React.FC<{}> = () => {
  const count = useCountOffReverseCounter();
  console.log(count);
  return <div className={styles["timecode-countoff"]}>{count}</div>;
};
