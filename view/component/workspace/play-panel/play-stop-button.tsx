import * as React from "react";

import * as styles from "./play-stop-button.less";
import { useQuery } from "@apollo/client";
import {
  PLAYING_CLIENT,
  RECORDING_CLIENT
} from "../../../state/queries/vamp-queries";
import { RecordingClient, PlayingClient } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";
import { usePlay, useStop, useSeek } from "../../../state/vamp-state-hooks";

const PlayStopButton: React.FunctionComponent = () => {
  const vampId = useCurrentVampId();

  const play = usePlay();
  const stop = useStop();
  const seek = useSeek();

  const { data } = useQuery<PlayingClient>(PLAYING_CLIENT, {
    variables: { vampId }
  });
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });

  const image = data.vamp.playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");

  const handleClick = (): void => {
    if (data.vamp.playing) {
      if (recordingData.vamp.recording) {
        seek(0);
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
