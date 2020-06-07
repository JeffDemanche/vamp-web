/*
 * A place for custom React hooks.
 */

import { useQuery } from "react-apollo";
import { gql } from "apollo-boost";

export const useCurrentVampId = (): string => {
  const { data } = useQuery(gql`
    query GetCurrentVampId {
      id @client
    }
  `);
  return data.id;
};

export const useCurrentUserId = (): string => {
  const { data } = useQuery(gql`
    query GetCurrentUserId {
      me @client {
        id
      }
    }
  `);
  if (data.me == null) {
    return null;
  }
  return data.me.id;
};
