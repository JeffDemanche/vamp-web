import * as React from "react";

import * as styles from "./cab.less";

import { useQuery } from "@apollo/client";
import { PLAYING_CLIENT } from "../../../state/queries/vamp-queries";
import { PlayingClient } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";
import {
  usePlay,
  usePause,
  useStop,
  useRecord
} from "../../../state/vamp-state-hooks";

/**
 * This is the basic record button that shows up when the Vamp is empty.
 */
const CabNew: React.FunctionComponent = () => {
  const vampId = useCurrentVampId();

  const play = usePlay();
  const pause = usePause();
  const stop = useStop();
  const record = useRecord();

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
