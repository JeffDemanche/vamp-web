import * as React from "react";

import * as styles from "./play-stop-button.less";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "react-apollo";
import { SEEK } from "../../../state/mutations";

const PLAYING = gql`
  query Playing {
    playing @client
  }
`;

const RECORDING = gql`
  query Recording {
    recording @client
  }
`;

const PLAY = gql`
  mutation Play {
    play @client
  }
`;

const PAUSE = gql`
  mutation Play {
    pause @client
  }
`;

const STOP = gql`
  mutation Stop {
    stop @client
  }
`;

const PlayStopButton: React.FunctionComponent = () => {
  const [play] = useMutation(PLAY);
  const [pause] = useMutation(PAUSE);
  const [stop] = useMutation(STOP);
  const [seek] = useMutation(SEEK);

  const { data, loading, error } = useQuery(PLAYING);
  const { data: recordingData } = useQuery(RECORDING);

  const image = data.playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");

  const handleClick = (): void => {
    if (data.playing) {
      if (recordingData.recording) {
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
