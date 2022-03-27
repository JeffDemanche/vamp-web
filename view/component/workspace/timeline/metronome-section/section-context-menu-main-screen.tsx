import * as React from "react";
import * as styles from "./section-context-menu.less";
import { ContextMenuScreenProps } from "../../../element/menu/context-menu";

export const SectionContextMenuMainScreen: React.FC<ContextMenuScreenProps> = ({
  pushScreen
}: ContextMenuScreenProps) => {
  return (
    <div className={styles["main-screen-container"]}>
      <a>Edit</a>
      <a>Delete</a>
    </div>
  );
};
