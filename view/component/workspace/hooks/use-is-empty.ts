import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { UseIsEmpty } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";

const USE_IS_EMPTY_QUERY = gql`
  query UseIsEmpty($vampId: ID!) {
    vamp(id: $vampId) @client {
      clips {
        id
      }
    }
  }
`;

/**
 * Returns a boolean value of whether the current vamp is in the "empty state."
 */
export const useIsEmpty = (): boolean => {
  const vampId = useCurrentVampId();

  const {
    data: {
      vamp: { clips }
    }
  } = useQuery<UseIsEmpty>(USE_IS_EMPTY_QUERY, {
    variables: { vampId }
  });

  return clips.length === 0;
};
