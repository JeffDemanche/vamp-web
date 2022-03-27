import { ContextMenuScreen } from "../../element/menu/context-menu";
import { UserContextMenuMainScreen } from "./user-context-menu-main-screen";

export enum UserMenuScreens {
  MainScreen
}

export const userContextMenuScreens = ({
  userId
}: {
  userId: string;
}): ContextMenuScreen<object>[] => [
  {
    id: UserMenuScreens.MainScreen,
    title: `User`,
    Component: UserContextMenuMainScreen,
    componentProps: { userId }
  }
];
