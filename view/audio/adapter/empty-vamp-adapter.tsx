import { gql, useApolloClient, useMutation } from "@apollo/client";
import * as React from "react";
import { useContext, useEffect } from "react";
import { PlaybackContext } from "../../component/workspace/context/recording/playback-context";
import { useIsEmpty } from "../../component/workspace/hooks/use-is-empty";
import {
  useCurrentUserId,
  useCurrentVampId,
  usePrevious
} from "../../util/react-hooks";

const UPDATE_CAB_MUTATION = gql`
  mutation EmptyVampAdapterUpdateCab(
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
 * This adapter handles "when the Vamp becomes empty." When that happens, we
 * seek to 0 and update the cab.
 */
export const EmptyVampAdapter: React.FC<{}> = () => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const empty = useIsEmpty();
  const prevEmpty = usePrevious(empty);

  const { cache } = useApolloClient();

  const { seek } = useContext(PlaybackContext);

  const [updateCab] = useMutation(UPDATE_CAB_MUTATION);

  useEffect(() => {
    if (empty && !prevEmpty) {
      seek(0);
      updateCab({
        variables: { userId, vampId, start: 0 }
      });
    }
  }, [cache, empty, prevEmpty, seek, updateCab, userId, vampId]);

  return null;
};
