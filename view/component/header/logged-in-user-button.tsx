import * as React from "react";
import { VampButton } from "../element/button";
import { VampPopover } from "../element/popover";
import { useMutation } from "react-apollo";
import { NewVamp } from "../wrapper/new-vamp";
import { User } from "../../state/queries/user-queries";
import { LOGOUT_SERVER } from "../../state/queries/user-mutations";
import { LogoutServer } from "../../state/apollotypes";

import * as styles from "./logged-in-user-button.less";

interface LoggedInUserButtonProps {
  style?: React.CSSProperties;
  me: User;
}

const LoggedInUserButton = (props: LoggedInUserButtonProps): JSX.Element => {
  // Data contains the user data resulting from the logout mutation.
  const [logout, logoutResponse] = useMutation<LogoutServer>(LOGOUT_SERVER);

  return (
    <VampPopover
      id="popover-logged-in-user-button"
      placement="bottom"
      content={
        <>
          <NewVamp creatorId={props.me.id}>
            <a href="#" style={styles["a"]}>
              New Vamp
            </a>
          </NewVamp>
          <a
            href="/"
            onClick={(): void => {
              logout({ variables: {} });
            }}
            style={styles["a"]}
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
