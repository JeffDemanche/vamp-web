import { gql, useQuery } from "@apollo/client";
import { CabMode, UseLoopPointsQuery } from "../../../state/apollotypes";
import { useCurrentUserId, useCurrentVampId } from "../../../util/react-hooks";

export const USE_LOOP_POINTS_QUERY = gql`
  query UseLoopPointsQuery($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      cab {
        start
        duration
        mode
      }
    }
  }
`;

export const useLoopPoints = (): {
  loopPoints: [number, number];
  mode: CabMode;
} => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const { data } = useQuery<UseLoopPointsQuery>(USE_LOOP_POINTS_QUERY, {
    variables: { vampId, userId }
  });

  const mode = data?.userInVamp?.cab?.mode;
  const loopA = data?.userInVamp?.cab?.start;
  const loopB =
    mode !== CabMode.INFINITE
      ? data?.userInVamp?.cab?.start + data?.userInVamp?.cab?.duration
      : undefined;

  if (loopA === undefined) throw new Error("Loop point A must be defined.");
  if (loopB !== undefined && loopB < loopA)
    throw new Error("Loop point B must come after loop point A");

  return { loopPoints: [loopA, loopB], mode };
};
