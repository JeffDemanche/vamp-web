import * as React from "react";

import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";
import * as styles from "./cab.less";
import {
  useCurrentVampId,
  useCurrentUserId,
  usePrevious
} from "../../../react-hooks";
import { CabMainQuery, UpdateCab } from "../../../state/apollotypes";
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkpaceDuration,
  useWorkspaceTime
} from "../../../workspace-hooks";
import MovableComponent from "../../element/movable-component";
import Playhead from "../../element/playhead";
import { useState, useEffect } from "react";
import { useRecord, useSeek, useStop } from "../../../state/vamp-state-hooks";

const CAB_MAIN_QUERY = gql`
  query CabMainQuery($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id @client
      cab @client {
        user @client {
          id @client
        }
        start @client
        duration @client
      }
    }
  }
`;

const UPDATE_CAB = gql`
  mutation UpdateCab(
    $userId: ID!
    $vampId: ID!
    $start: Float
    $duration: Float
  ) {
    updateUserInVamp(
      update: {
        userId: $userId
        vampId: $vampId
        cabStart: $start
        cabDuration: $duration
      }
    ) {
      id
    }
  }
`;

/**
 * The cab that gets displayed in a Vamp with clips when not recording. Can be
 * moved, has a duration, controls for looping, etc.
 *
 * The cab will also mutate to the server.
 */
const CabMain: React.FC = () => {
  const { cache } = useApolloClient();

  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const widthFn = useWorkspaceWidth();
  const positionFn = useWorkspaceLeft();

  const durationFn = useWorkpaceDuration();
  const timeFn = useWorkspaceTime();

  const [adjusting, setAdjusting] = useState(false);

  const [updateCab] = useMutation<UpdateCab>(UPDATE_CAB);

  const stop = useStop();
  const record = useRecord();
  const seek = useSeek();

  const { data, loading, error } = useQuery<CabMainQuery>(CAB_MAIN_QUERY, {
    variables: { vampId, userId }
  });

  if (error) console.error(error);

  const {
    userInVamp: {
      id: userInVampId,
      cab: { start, duration }
    }
  } = data || { userInVamp: { id: "", cab: { start: 0, duration: 0 } } };

  const prevStart = usePrevious(start);

  useEffect(() => {
    if (prevStart !== undefined) {
      seek(start);
    }
  }, [start]);

  /**
   * updateCab does not update the local cache, so we're doing it manually here.
   * There's probably a better way of doing this.
   */
  const updateCabWithClient = (
    userId: string,
    vampId: string,
    duration: number,
    start: number
  ): void => {
    updateCab({
      variables: { userId, vampId, duration, start }
    });
    cache.modify({
      id: cache.identify({ __typename: "UserInVamp", id: userInVampId }),
      fields: {
        cab: () => {
          return { __typename: "Cab", start, duration };
        }
      }
    });
  };

  const playhead = adjusting ? null : (
    <Playhead containerStart={start} containerDuration={duration} />
  );

  if (loading || !data) {
    return null;
  } else {
    return (
      <MovableComponent
        initialWidth={widthFn(duration)}
        height={"125px"}
        initialLeft={positionFn(start)}
        onWidthChanged={(newWidth): void => {
          updateCabWithClient(userId, vampId, durationFn(newWidth), start);
        }}
        onLeftChanged={(newLeft): void => {
          const start = timeFn(newLeft);
          updateCabWithClient(userId, vampId, duration, start);
        }}
        onAdjust={(active): void => {
          setAdjusting(active);
        }}
        onClick={(): void => {
          record();
        }}
      >
        <div className={styles["cab-main"]}>
          {playhead}
          <img src={require("../../../img/vector/record.svg")} />
        </div>
      </MovableComponent>
    );
  }
};

export default CabMain;
