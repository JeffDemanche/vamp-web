import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { sec } from "mathjs";
import React, { useCallback, useEffect, useMemo } from "react";
import { CountOff } from "../../util/count-off-hooks";
import { useMeasures } from "../../util/metronome-hooks";
import {
  useCurrentUserId,
  useCurrentVampId,
  usePrevious
} from "../../util/react-hooks";
import { SchedulerInstance } from "../scheduler";

const SEEK_ADAPTER_QUERY = gql`
  query SeekAdapterQuery($vampId: ID!, $userId: ID!) {
    vamp(id: $vampId) @client {
      id
      playing
      playPosition
      playStartTime
    }
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      cab {
        start
      }
    }
  }
`;

interface SeekAdapterProps {
  scheduler: typeof SchedulerInstance;
}

/**
 * Handles changes in state that seek the timeline, updating audio modules like
 * the scheduler when it happens.
 */
export const SeekAdapter: React.FC<SeekAdapterProps> = ({
  scheduler
}: SeekAdapterProps) => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const {
    data: {
      vamp: { playing, playPosition, playStartTime },
      userInVamp: {
        cab: { start: cabStart }
      }
    }
  } = useQuery(SEEK_ADAPTER_QUERY, { variables: { vampId, userId } });

  const seek = useCallback(
    (time: number): void => {
      scheduler.seek(time);
    },
    [scheduler]
  );

  const prevData = usePrevious({
    playing,
    playPosition,
    playStartTime,
    cabStart
  });

  useEffect(() => {
    if (prevData) {
      // Signals that some seek has occured while playing, such as restarting at
      // the beginning during a loop.
      if (
        prevData &&
        playing &&
        prevData.playing &&
        playStartTime != prevData.playStartTime
      ) {
        seek(cabStart);
      }

      // Signalled when when a seek occured while not playing.
      if (!playing && playPosition != prevData.playPosition) {
        seek(playPosition);
      }
    }
  }, [cabStart, playPosition, playStartTime, playing, prevData, seek]);

  return null;
};
