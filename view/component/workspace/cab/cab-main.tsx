import * as React from "react";

import * as styles from "./cab.less";
import { useQuery, useMutation, useApolloClient } from "react-apollo";
import { useCurrentVampId, useCurrentUserId } from "../../../react-hooks";
import { gql } from "apollo-boost";
import {
  CabMainQuery,
  UpdateCab,
  StopClient,
  RecordClient,
  Seek
} from "../../../state/apollotypes";
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkpaceDuration,
  useWorkspaceTime
} from "../../../workspace-hooks";
import MovableComponent from "../../element/movable-component";
import Playhead from "../../element/playhead";
import { useState, useEffect } from "react";
import {
  STOP_CLIENT,
  RECORD_CLIENT,
  SEEK_CLIENT
} from "../../../state/queries/vamp-mutations";

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
  const client = useApolloClient();

  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const widthFn = useWorkspaceWidth();
  const positionFn = useWorkspaceLeft();

  const durationFn = useWorkpaceDuration();
  const timeFn = useWorkspaceTime();

  const [adjusting, setAdjusting] = useState(false);

  const [updateCab] = useMutation<UpdateCab>(UPDATE_CAB);

  const [stop] = useMutation<StopClient>(STOP_CLIENT);
  const [record] = useMutation<RecordClient>(RECORD_CLIENT);
  const [seek] = useMutation<Seek>(SEEK_CLIENT);

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

  useEffect(() => {
    seek({ variables: { time: start } });
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
    client.writeData({
      data: {
        userInVamp: {
          __typename: "UserInVamp",
          id: userInVampId,
          cab: { __typename: "Cab", start, duration }
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
        height={150}
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
          console.log("recording");
          //record();
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
