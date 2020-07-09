import * as React from "react";

import * as styles from "./cab.less";
import { useQuery, useMutation, useApolloClient } from "react-apollo";
import { useCurrentVampId, useCurrentUserId } from "../../../react-hooks";
import { gql } from "apollo-boost";
import { CabMainQuery, UpdateCab } from "../../../state/apollotypes";
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkpaceDuration,
  useWorkspaceTime
} from "../../../workspace-hooks";
import MovableComponent from "../../element/movable-component";

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
const CabMain: React.FunctionComponent = () => {
  const client = useApolloClient();

  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const widthFn = useWorkspaceWidth();
  const positionFn = useWorkspaceLeft();

  const durationFn = useWorkpaceDuration();
  const timeFn = useWorkspaceTime();

  const [updateCab] = useMutation<UpdateCab>(UPDATE_CAB);

  const { data, loading, error } = useQuery<CabMainQuery>(CAB_MAIN_QUERY, {
    variables: { vampId, userId }
  });

  if (loading || !data) return null;

  if (error) console.error(error);

  const {
    userInVamp: {
      id: userInVampId,
      cab: { start, duration }
    }
  } = data;

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

  return (
    <MovableComponent
      initialWidth={widthFn(duration)}
      height={150}
      initialLeft={positionFn(start)}
      onWidthChanged={(newWidth): void => {
        updateCabWithClient(userId, vampId, durationFn(newWidth), start);
      }}
      onLeftChanged={(newLeft): void => {
        updateCabWithClient(userId, vampId, duration, timeFn(newLeft));
      }}
    >
      <div className={styles["cab-main"]}>
        <img src={require("../../../img/vector/record.svg")} />
      </div>
    </MovableComponent>
  );
};

export default CabMain;
