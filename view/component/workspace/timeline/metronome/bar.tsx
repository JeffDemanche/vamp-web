import classNames from "classnames";
import * as React from "react";
import { useMemo, useRef } from "react";
import { useMetronomeDimensions } from "../../context/metronome-context";
import * as styles from "./metronome.less";

interface BarProps {
  num: number;
  depth: number;
  left: number;
  top: number;
  width: number;
  label?: string;
  bpm: number;
  beats: number;
  children?: React.ReactChildren | React.ReactChild;
}

export const Bar: React.FC<BarProps> = ({
  num,
  depth,
  left,
  top,
  width,
  label,
  bpm,
  beats,
  children
}: BarProps) => {
  const { barHeight } = useMetronomeDimensions();

  const text = label || `${num}`;

  const labelRef = useRef<HTMLDivElement>();

  const verticalLines = useMemo(() => {
    const lines: JSX.Element[] = [];

    for (let i = 0; i < beats; i++) {
      lines.push(
        <div
          key={i}
          style={{ left: `${(100 * i) / beats}%` }}
          className={classNames(styles["beat-marker"], {
            [styles["first-beat"]]: i === 0,
            [styles["other-beat"]]: i !== 0
          })}
        ></div>
      );
    }

    return lines;
  }, [beats]);

  return (
    <div
      style={{
        left,
        height: `${barHeight}px`,
        width: `${width}px`,
        top: `${top}px`
      }}
      className={classNames(styles["bar"], depth !== 0 && styles["variant"])}
    >
      {children}
      <div className={styles["label"]} ref={labelRef}>
        {text}
      </div>
      {verticalLines}
    </div>
  );
};
