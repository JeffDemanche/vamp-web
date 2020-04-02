import * as React from "react";

import styles = require("./playhead.less");

interface PlayheadRecordingProps {}

const PlayheadRecording: React.FunctionComponent<PlayheadRecordingProps> = () => {
  return <div className={styles["playhead-new"]}></div>;
};

export { PlayheadRecording };
