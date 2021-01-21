import classNames = require("classnames");
import * as React from "react";
import { useMemo, useRef } from "react";
import { useMetronomeDimensions } from "../../../../util/metronome-hooks";
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
  gapWidth: number;
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
  gapWidth
}: BarProps) => {
  const { barHeight } = useMetronomeDimensions();

  const text = label || `${num}`;

  const labelRef = useRef<HTMLDivElement>();
  const labelWidth = labelRef.current
    ? labelRef.current.getBoundingClientRect().width
    : 0;

  const markerStyle = useMemo(() => {
    if (labelWidth > width / beats) {
      return { height: "20%", opacity: 0.7 };
    } else {
      return { height: "66%", opacity: 0.5 };
    }
  }, [labelWidth, width, beats]);

  const verticalLines = useMemo(() => {
    const lines: JSX.Element[] = [];

    for (let i = 1; i < beats; i++) {
      lines.push(
        <div
          key={i}
          style={{ left: `${(100 * i) / beats}%`, ...markerStyle }}
          className={styles["beat-marker"]}
        ></div>
      );
    }

    return lines;
  }, [beats, markerStyle]);

  return (
    <div
      style={{
        left,
        height: `${barHeight}px`,
        width: `${width - gapWidth}px`,
        top: `${top}px`
      }}
      className={classNames(styles["bar"], depth !== 0 && styles["variant"])}
    >
      <div className={styles["label"]} ref={labelRef}>
        {text}.
      </div>
      {verticalLines}
    </div>
  );
};
