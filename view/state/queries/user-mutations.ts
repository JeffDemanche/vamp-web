import { gql } from "@apollo/client";

/**
 * Ends the user session on the server and returns the ID of the user that did
 * so.
 */
export const LOGOUT_SERVER = gql`
  mutation LogoutServer {
    logout {
      id
    }
  }
`;
