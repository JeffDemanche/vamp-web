/**
 * For now, just a repository of common GraphQL queries.
 */

import { gql } from "apollo-boost";

export const GET_PLAY_POSITION_START_TIME = gql`
  query GetPlayPosition {
    playPosition @client
    playStartTime @client
  }
`;
