import * as React from "react";
import { ContextMenuScreenProps } from "../../../element/menu/context-menu";
import { BarScreens } from "./bar-context-menu";

export const BarContextMenuMainScreen: React.FC<ContextMenuScreenProps> = ({
  pushScreen
}: ContextMenuScreenProps) => {
  return (
    <div>
      <a
        onClick={(): void => {
          pushScreen(BarScreens.BarInsertSection);
        }}
      >
        Insert section
      </a>
    </div>
  );
};
