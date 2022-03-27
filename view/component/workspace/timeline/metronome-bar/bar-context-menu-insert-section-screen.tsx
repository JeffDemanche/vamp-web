import * as React from "react";
import * as styles from "./bar-context-menu.less";
import { VampButton } from "../../../element/button";
import { ContextMenuScreenProps } from "../../../element/menu/context-menu";

export const BarContextMenuInsertSectionScreen: React.FC<ContextMenuScreenProps> = ({
  pushScreen
}: ContextMenuScreenProps) => {
  return (
    <div className={styles["insert-section-container"]}>
      <span># Bars</span>
      <span>BPM</span>
      <VampButton>Insert</VampButton>
    </div>
  );
};
