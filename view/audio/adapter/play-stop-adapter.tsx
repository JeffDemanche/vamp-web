import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useCallback, useEffect } from "react";
import { PlayStopAdapterQuery } from "../../state/apollotypes";
import { useCurrentVampId, usePrevious } from "../../util/react-hooks";
import { SchedulerInstance } from "../scheduler";

export const PLAY_STOP_ADAPTER_QUERY = gql`
  query PlayStopAdapterQuery($vampId: ID!) {
    vamp(id: $vampId) @client {
      id
      playing
      countingOff
    }
  }
`;

interface PlayStopAdapterProps {
  scheduler: typeof SchedulerInstance;
}

/**
 * Handles reading from state to play, stop, pause, etc. the scheduler.
 */
export const PlayStopAdapter: React.FC<PlayStopAdapterProps> = ({
  scheduler
}: PlayStopAdapterProps) => {
  const vampId = useCurrentVampId();

  const {
    data: {
      vamp: { playing, countingOff }
    }
  } = useQuery<PlayStopAdapterQuery>(PLAY_STOP_ADAPTER_QUERY, {
    variables: { vampId }
  });

  const prevData = usePrevious({ playing, countingOff });

  const play = useCallback((): void => {
    scheduler.play();
  }, [scheduler]);

  const stop = useCallback((): void => {
    scheduler.stop();
  }, [scheduler]);

  useEffect(() => {
    if (prevData) {
      // When countingOff was true, the scheduler count off sequent handles
      // playback automatically (for timing reasons) and we don't need to do it
      // from here.
      if (!prevData.countingOff) {
        if (playing && !prevData.playing) {
          play();
        }
      }
      if (!playing && prevData.playing) {
        stop();
      }
    }
  }, [play, playing, prevData, stop]);

  return null;
};
