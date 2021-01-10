import * as React from "react";
import { useMemo } from "react";
import { Measure, useMeasures } from "../../../../util/metronome-hooks";
import {
  useWindowDimensions,
  useWorkspaceLeft,
  useWorkspaceTime,
  useWorkspaceWidth
} from "../../../../util/workspace-hooks";
import { Bar } from "./bar";
import * as styles from "./metronome.less";

export const Metronome: React.FC<{}> = () => {
  const leftFn = useWorkspaceLeft();
  const timeFn = useWorkspaceTime();
  const widthFn = useWorkspaceWidth();
  const { width } = useWindowDimensions();

  const timeBounds = useMemo(() => {
    const minScreenTime = timeFn(0);
    const maxScreenTime = timeFn(width);

    return [minScreenTime, maxScreenTime];
  }, [timeFn, width]);

  const measureMap = useMeasures({ start: timeBounds[0], end: timeBounds[1] });

  const gapWidth = useMemo(() => {
    const numGaps = Object.keys(measureMap).length - 1;
    return Math.max(4.0 / (numGaps / 5.0), 1.5);
  }, [measureMap]);

  const bars = useMemo(() => {
    const measureNums = Object.keys(measureMap).map(key => parseInt(key));
    const minMeasure = Math.min(...measureNums);
    const maxMeasure = Math.max(...measureNums);

    const measures: Measure[] = [];

    for (let n = minMeasure; n <= maxMeasure; n++) {
      measures.push(measureMap[n]);
    }

    return measures.map(measure => (
      <Bar
        num={measure.num}
        key={measure.num}
        left={leftFn(measure.timeStart)}
        width={widthFn(
          (60.0 / measure.section.bpm) * measure.section.beatsPerBar
        )}
        bpm={measure.section.bpm}
        beats={measure.section.beatsPerBar}
        label={measure.section.label}
        gapWidth={gapWidth}
      ></Bar>
    ));
  }, [measureMap, gapWidth, leftFn, widthFn]);

  return <div className={styles["metronome"]}>{bars}</div>;
};
