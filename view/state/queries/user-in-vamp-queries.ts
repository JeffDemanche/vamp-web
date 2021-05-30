import { gql } from "@apollo/client";

export const USER_IN_VAMP_CLIENT = gql`
  query UserInVampClient($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      user {
        id
      }
      vamp {
        id
      }
      cab {
        user {
          id
        }
        start
        duration
      }
    }
  }
`;

export const CAB_CLIENT = gql`
  query CabClient($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      cab {
        start
        duration
      }
    }
  }
`;
