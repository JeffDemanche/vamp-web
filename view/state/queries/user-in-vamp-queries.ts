import { gql } from "apollo-boost";

export const USER_IN_VAMP_CLIENT = gql`
  query UserInVampClient($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id @client
      user @client {
        id @client
      }
      vamp @client {
        id @client
      }
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
