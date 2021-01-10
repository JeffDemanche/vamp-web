import * as React from "react";
import { useMemo, useRef } from "react";
import * as styles from "./metronome.less";

interface BarProps {
  num: number;
  left: number;
  width: number;
  label?: string;
  bpm: number;
  beats: number;
  gapWidth: number;
}

export const Bar: React.FC<BarProps> = ({
  num,
  left,
  width,
  label,
  bpm,
  beats,
  gapWidth
}: BarProps) => {
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
      style={{ left, width: `${width - gapWidth}px` }}
      className={styles["bar"]}
    >
      <div className={styles["label"]} ref={labelRef}>
        {text}.
      </div>
      {verticalLines}
    </div>
  );
};
