import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useCallback, useContext, useEffect } from "react";
import { PlaybackContext } from "../../component/workspace/context/recording/playback-context";
import {
  useCurrentUserId,
  useCurrentVampId,
  usePrevious
} from "../../util/react-hooks";
import { useIsEmpty } from "../../util/workspace-hooks";
import { SchedulerInstance } from "../scheduler";

const SEEK_ADAPTER_QUERY = gql`
  query SeekAdapterQuery($vampId: ID!, $userId: ID!) {
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
      userInVamp: {
        cab: { start: cabStart }
      }
    }
  } = useQuery(SEEK_ADAPTER_QUERY, { variables: { vampId, userId } });

  const { seek: stateSeek, loopPointA, loopPointB } = useContext(
    PlaybackContext
  );

  const seek = useCallback(
    (time: number, loopPoint): void => {
      scheduler.seek(time, loopPoint);
    },
    [scheduler]
  );

  const prevData = usePrevious({
    loopPointA,
    loopPointB
  });

  // Seeks to the current cab location on component load (essentially on page
  // load).
  useEffect(() => {
    stateSeek(cabStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !prevData ||
      loopPointA !== prevData.loopPointA ||
      loopPointB !== prevData.loopPointB
    ) {
      seek(loopPointA, loopPointB);
    }
  }, [loopPointA, loopPointB, prevData, seek]);

  return null;
};
