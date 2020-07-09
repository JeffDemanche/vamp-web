import * as React from "react";

import * as styles from "./play-stop-button.less";
import { useQuery, useMutation } from "react-apollo";
import {
  PLAYING_CLIENT,
  RECORDING_CLIENT
} from "../../../state/queries/vamp-queries";
import {
  PLAY_CLIENT,
  PAUSE_CLIENT,
  STOP_CLIENT,
  SEEK_CLIENT
} from "../../../state/queries/vamp-mutations";
import { RecordingClient, PlayingClient } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";

const PlayStopButton: React.FunctionComponent = () => {
  const vampId = useCurrentVampId();

  const [play] = useMutation(PLAY_CLIENT);
  const [pause] = useMutation(PAUSE_CLIENT);
  const [stop] = useMutation(STOP_CLIENT);
  const [seek] = useMutation(SEEK_CLIENT);

  const { data, loading, error } = useQuery<PlayingClient>(PLAYING_CLIENT, {
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
        seek({ variables: { time: 0 } });
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
