import * as React from "react";
import { VampButton } from "../element/button";
import { VampPopover } from "../element/popover";
import { useMutation } from "react-apollo";
import { gql } from "apollo-boost";

interface LoggedInUserButtonProps {
  username: string;
  style?: React.CSSProperties;
}

const LoggedInUserButton = (props: LoggedInUserButtonProps): JSX.Element => {
  const LOGOUT = gql`
    mutation {
      logout {
        id
      }
    }
  `;

  // Data contains the user data resulting from the logout mutation.
  const [logout, { data }] = useMutation(LOGOUT);

  return (
    <VampPopover
      id="popover-logged-in-user-button"
      placement="bottom"
      content={
        <a
          href="/"
          onClick={() => {
            logout({ variables: {} });
          }}
        >
          Logout
        </a>
      }
      title="User Settings"
    >
      <VampButton style={props.style}>{props.username}</VampButton>
    </VampPopover>
  );
};

export default LoggedInUserButton;
