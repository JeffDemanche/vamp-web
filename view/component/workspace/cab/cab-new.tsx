import * as React from "react";

import * as styles from "./cab.less";

import { gql } from "apollo-boost";
import { useQuery, useMutation } from "react-apollo";
import { PLAY, PAUSE, STOP, RECORD } from "../../../state/mutations";

const PLAYING = gql`
  query Playing {
    playing @client
  }
`;

const CabNew: React.FunctionComponent = () => {
  const [play] = useMutation(PLAY);
  const [pause] = useMutation(PAUSE);
  const [stop] = useMutation(STOP);
  const [record] = useMutation(RECORD);

  const { data, loading, error } = useQuery(PLAYING);

  return (
    <div
      className={styles["cab-new"]}
      onClick={(): void => {
        if (data.playing) {
          stop();
        } else {
          record();
        }
      }}
    >
      <img src={require("../../../img/vector/record.svg")} />
    </div>
  );
};

export { CabNew };
