import * as React from "react";

import * as styles from "./cab.less";

import { PlaybackContext } from "../context/recording/playback-context";
import { useContext } from "react";

/**
 * This is the basic record button that shows up when the Vamp is empty.
 */
const CabNew: React.FunctionComponent = () => {
  const { playing, stop, countOff } = useContext(PlaybackContext);

  return (
    <div
      className={styles["cab-new"]}
      onClick={(): void => {
        if (playing) {
          stop();
        } else {
          countOff(true);
        }
      }}
    >
      <img src={require("../../../img/vector/record.svg")} />
    </div>
  );
};

export { CabNew };
