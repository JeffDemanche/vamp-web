import classNames = require("classnames");
import * as React from "react";
import { useState } from "react";
import * as styles from "./toggle-button.less";

interface VampToggleButtonProps {
  on?: boolean;
  onToggle?: (e: React.MouseEvent, on: boolean) => void;
  style?: React.CSSProperties;
  children?: React.ReactChild | React.ReactChild[];
}

export const VampToggleButton: React.FC<VampToggleButtonProps> = ({
  on,
  onToggle,
  style,
  children
}: VampToggleButtonProps) => {
  const [enabled, setEnabled] = useState(on);

  return (
    <button
      style={style}
      className={classNames(
        styles["toggleButton"],
        enabled ? styles["toggleButtonOn"] : styles["toggleButtonOff"]
      )}
      onClick={(e): void => {
        const opposite = !enabled;
        setEnabled(opposite);
        onToggle && onToggle(e, opposite);
      }}
    >
      <div className={enabled ? styles["textOn"] : styles["textOff"]}>
        {children}
      </div>
    </button>
  );
};
