import * as React from "react";

import * as styles from "./play-stop-button.less";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "react-apollo";

const PLAYING = gql`
  query Playing {
    playing @client
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

  const { data, loading, error } = useQuery(PLAYING);

  const image = data.playing
    ? require("../../../img/vector/stop.svg")
    : require("../../../img/vector/play.svg");

  return (
    <div
      className={styles["play-stop-button"]}
      onClick={(): void => {
        if (data.playing) {
          stop();
        } else {
          play();
        }
      }}
    >
      <img src={image} />
    </div>
  );
};

export { PlayStopButton };
