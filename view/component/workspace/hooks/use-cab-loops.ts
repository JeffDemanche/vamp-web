import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { CabMode, UseCabLoops } from "../../../state/apollotypes";
import { useCurrentUserId, useCurrentVampId } from "../../../util/react-hooks";

const USE_CAB_LOOPS_QUERY = gql`
  query UseCabLoops($vampId: ID!, $userId: ID!) {
    userInVamp(userId: $userId, vampId: $vampId) @client {
      cab {
        mode
      }
    }
  }
`;

export const useCabLoops = (): boolean => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const {
    data: {
      userInVamp: {
        cab: { mode }
      }
    }
  } = useQuery<UseCabLoops>(USE_CAB_LOOPS_QUERY, {
    variables: { vampId, userId }
  });

  return !(mode === CabMode.INFINITE);
};
