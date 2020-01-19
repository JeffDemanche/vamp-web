import * as React from "react";
import { VampButton } from "../element/button";
import { VampPopover } from "../element/popover";
import { useMutation } from "react-apollo";
import { NewVamp } from "../wrapper/new-vamp";
import { LOGOUT, User } from "../../queries/user-queries";

interface LoggedInUserButtonProps {
  style?: React.CSSProperties;
  me: User;
}

const LoggedInUserButton = (props: LoggedInUserButtonProps): JSX.Element => {
  // Data contains the user data resulting from the logout mutation.
  const [logout, logoutResponse] = useMutation(LOGOUT);

  return (
    <VampPopover
      id="popover-logged-in-user-button"
      placement="bottom"
      content={
        <>
          <NewVamp creatorId={props.me.id}>
            <a href="#">New Vamp</a>
          </NewVamp>
          <a
            href="/"
            onClick={() => {
              logout({ variables: {} });
            }}
          >
            Logout
          </a>
        </>
      }
      title="User Settings"
    >
      <VampButton style={props.style} variant="primary">
        {props.me.username}
      </VampButton>
    </VampPopover>
  );
};

export default LoggedInUserButton;
