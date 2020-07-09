import * as React from "react";

import * as styles from "./cab.less";

import { useQuery, useMutation } from "react-apollo";
import { PLAYING_CLIENT } from "../../../state/queries/vamp-queries";
import {
  PLAY_CLIENT,
  PAUSE_CLIENT,
  STOP_CLIENT,
  RECORD_CLIENT
} from "../../../state/queries/vamp-mutations";
import {
  PauseClient,
  StopClient,
  RecordClient,
  PlayClient,
  PlayingClient
} from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";

/**
 * This is the basic record button that shows up when the Vamp is empty.
 */
const CabNew: React.FunctionComponent = () => {
  const vampId = useCurrentVampId();

  const [play] = useMutation<PlayClient>(PLAY_CLIENT);
  const [pause] = useMutation<PauseClient>(PAUSE_CLIENT);
  const [stop] = useMutation<StopClient>(STOP_CLIENT);
  const [record] = useMutation<RecordClient>(RECORD_CLIENT);

  const { data, loading, error } = useQuery<PlayingClient>(PLAYING_CLIENT, {
    variables: { vampId }
  });

  return (
    <div
      className={styles["cab-new"]}
      onClick={(): void => {
        if (data.vamp.playing) {
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
