import * as React from "react";

import styles = require("./playhead.less");

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

const PlayheadNew: React.FunctionComponent = () => {
  const [play] = useMutation(PLAY);
  const [pause] = useMutation(PAUSE);
  const [stop] = useMutation(STOP);

  const { data, loading, error } = useQuery(PLAYING);

  return (
    <div
      className={styles["playhead-new"]}
      onClick={(): void => {
        if (data.playing) {
          stop();
        } else {
          play();
        }
      }}
    >
      <img src={require("../../../img/vector/record.svg")} />
    </div>
  );
};

export { PlayheadNew };
