import * as React from "react";
import * as styles from "./floor.less";
import { HotKeys } from "react-hotkeys";
import { useFloor } from "../../../util/audio-module-hooks";

export const Floor: React.FC<{}> = () => {
  const floor = useFloor();

  return (
    <HotKeys
      keyMap={floor.keyMap}
      handlers={floor.keyHandlers}
      className={styles["hotkeys-wrapper"]}
    >
      <div className={styles["floor-container"]}></div>
    </HotKeys>
  );
};
