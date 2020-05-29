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
