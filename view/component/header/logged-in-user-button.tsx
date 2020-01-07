import * as React from "react";
import { VampButton } from "../element/button";
import { VampPopover } from "../element/popover";

import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

interface LoggedInUserButtonProps {
  username: string;
}

const LOG_OUT = gql`
  mutation logout {
    id
  }
`;

const LoggedInUserButton = (props: LoggedInUserButtonProps): JSX.Element => {
  const [logout, { data }] = useMutation(LOG_OUT);

  return (
    <VampPopover
      id="popover-logged-in-user-button"
      placement="bottom"
      content={<a href="facebook.com">facebook</a>}
      title="User Settings"
    >
      <VampButton text={props.username}></VampButton>
    </VampPopover>
  );
};

export default LoggedInUserButton;
