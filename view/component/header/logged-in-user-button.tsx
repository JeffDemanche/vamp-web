import * as React from "react";
import { VampButton } from "../element/button";
import { User } from "../../state/queries/user-queries";

import { useContextMenu } from "../element/menu/context-menu";
import { useRef } from "react";
import {
  userContextMenuScreens,
  UserMenuScreens
} from "./user-menu/user-context-menu";

interface LoggedInUserButtonProps {
  style?: React.CSSProperties;
  me: User;
}

const LoggedInUserButton = (props: LoggedInUserButtonProps): JSX.Element => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { openMenu } = useContextMenu({
    disableContextMenuEvent: true,
    target: buttonRef,
    screens: userContextMenuScreens({ userId: props.me.id }),
    initialScreen: UserMenuScreens.MainScreen
  });

  return (
    <VampButton
      style={props.style}
      onClick={(e: React.MouseEvent): void => {
        e.stopPropagation();
        const buttonBounding = buttonRef.current?.getBoundingClientRect();
        if (!buttonBounding) openMenu({ x: 0, y: 0 });
        else openMenu({ x: buttonBounding.x, y: buttonBounding.bottom + 5 });
      }}
      buttonRef={buttonRef}
      variant="primary"
    >
      {props.me.username}
    </VampButton>
  );
};

export default LoggedInUserButton;
