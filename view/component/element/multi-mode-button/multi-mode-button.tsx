import classNames from "classnames";
import * as React from "react";
import * as styles from "./multi-mode-button.less";

interface Mode {
  name: string;
  icon: JSX.Element;
}

interface MultiModeButtonProps {
  selectedIndex: number;
  modes: Mode[];
  onModeChange: (mode: Mode, index: number) => void;
}

export const MultiModeButton: React.FC<MultiModeButtonProps> = ({
  selectedIndex,
  modes,
  onModeChange
}: MultiModeButtonProps) => {
  const currentMode = modes[selectedIndex];
  const nextMode = selectedIndex + 1 >= modes.length ? 0 : selectedIndex + 1;

  const modeClass = `button-option-${selectedIndex + 1}`;

  return (
    <div className={styles["multi-mode-button"]}>
      <button
        className={classNames(
          styles["multi-mode-button-button"],
          styles[modeClass]
        )}
        onClick={(): void => {
          onModeChange(modes[nextMode], nextMode);
        }}
      >
        {currentMode.icon}
      </button>
      <span className={styles["multi-mode-button-text"]}>
        {currentMode.name}
      </span>
    </div>
  );
};
