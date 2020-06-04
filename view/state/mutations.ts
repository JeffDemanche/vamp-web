/**
 * Holds some common mutation GQLs.
 */

import { gql } from "apollo-boost";

export const PLAY = gql`
  mutation Play {
    play @client
  }
`;

export const PAUSE = gql`
  mutation Play {
    pause @client
  }
`;

export const STOP = gql`
  mutation Stop {
    stop @client
  }
`;

export const RECORD = gql`
  mutation Record {
    record @client
  }
`;
