import * as React from "react";

import * as styles from "./play-stop-button.less";
import { PlaybackContext } from "../context/recording/playback-context";
import { useContext } from "react";

const PlayStopButton: React.FunctionComponent = () => {
  const { playing, recording, play, stop, stopRecording } = useContext(
    PlaybackContext
  );

  const image = playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");

  const handleClick = (): void => {
    if (playing) {
      if (recording) {
        stopRecording();
      } else {
        stop();
      }
    } else {
      play();
    }
  };

  return (
    <div className={styles["play-stop-button"]} onClick={handleClick}>
      <img src={image} />
    </div>
  );
};

export { PlayStopButton };
