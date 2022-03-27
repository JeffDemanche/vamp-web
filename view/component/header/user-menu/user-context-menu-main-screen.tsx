import * as React from "react";
import * as styles from "./user-context-menu.less";
import { ContextMenuScreenProps } from "../../element/menu/context-menu";
import { LOGOUT_SERVER } from "../../../state/queries/user-mutations";
import { LogoutServer } from "../../../state/apollotypes";
import { useMutation } from "@apollo/client";
import { NewVamp } from "../../wrapper/new-vamp";

interface UserContextMenuMainScreenProps {
  userId: string;
}

export const UserContextMenuMainScreen: React.FC<ContextMenuScreenProps &
  UserContextMenuMainScreenProps> = ({
  userId
}: ContextMenuScreenProps & UserContextMenuMainScreenProps) => {
  // Data contains the user data resulting from the logout mutation.
  const [logout, logoutResponse] = useMutation<LogoutServer>(LOGOUT_SERVER);

  return (
    <div>
      <NewVamp creatorId={userId}>
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
    </div>
  );
};
