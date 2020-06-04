import { gql } from "apollo-boost";

/**
 *
 */

export interface User {
  id: string;
  username?: string;
  email?: string;
}

/**
 * Query the current session user's information.
 */
export const ME = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

/**
 * Ends the user session on the server and returns the ID of the user that did
 * so.
 */
export const LOGOUT = gql`
  mutation {
    logout {
      id
    }
  }
`;
