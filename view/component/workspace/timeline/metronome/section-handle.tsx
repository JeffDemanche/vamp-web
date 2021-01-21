import classNames = require("classnames");
import * as React from "react";
import * as styles from "./metronome.less";

interface SectionHandleProps {
  left: number;
  top: number;
  width: number;
  height: number;
  margin: number;
  depth: number;
  gapWidth: number;
  children?: React.ReactChild[];
}

export const SectionHandle: React.FC<SectionHandleProps> = ({
  left,
  top,
  width,
  height,
  margin,
  depth,
  gapWidth,
  children
}: SectionHandleProps) => {
  console.log(height);
  return (
    <div
      className={styles["section-handle-container"]}
      style={{
        left,
        width: `${width - gapWidth}px`,
        top: `${top}px`
      }}
    >
      <div
        className={classNames(styles["section-handle"], styles["variant"])}
        style={{
          height: `${height}px`,
          marginBottom: `${margin}px`
        }}
      ></div>
      {children}
    </div>
  );
};
