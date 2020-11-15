import { gql } from "@apollo/client";

export interface User {
  id: string;
  username?: string;
  email?: string;
}

/**
 * Query the current session user's information.
 */
export const ME_SERVER = gql`
  query MeServer {
    me {
      id
      username
      email
    }
  }
`;

export const ME_CLIENT = gql`
  query MeClient {
    me @client {
      id @client
      username @client
      email @client
    }
  }
`;
