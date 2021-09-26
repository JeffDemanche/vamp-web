import * as React from "react";
import { useCountOffReverseCounter } from "../context/recording/use-count-off-reverse-counter";
import * as styles from "./timecode-countoff.less";

export const TimecodeCountoff: React.FC<{}> = () => {
  const count = useCountOffReverseCounter();
  return <div className={styles["timecode-countoff"]}>{count}</div>;
};
