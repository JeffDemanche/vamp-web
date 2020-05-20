import * as React from "react";
import { useState, useEffect } from "react";
import { StateType } from "../../../redux/reducers";
import { connect } from "react-redux";

import styles = require("./timecode.less");

interface TimecodeProps {
  playing: boolean;
  playPosition: number;
  playStartTime: number;
}

const mapStateToProps = (state: StateType): TimecodeProps => {
  return {
    playing: state.workspace.playing,
    playPosition: state.workspace.playPosition,
    playStartTime: state.workspace.playStartTime
  };
};

const ConnectedTimecode: React.FunctionComponent<TimecodeProps> = ({
  playing,
  playPosition,
  playStartTime
}: TimecodeProps) => {
  // This "local state" time is initially set to the playPosition from the Redux
  // store.
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
      interval = setInterval(() => {
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

export const Timecode = connect(mapStateToProps)(ConnectedTimecode);
