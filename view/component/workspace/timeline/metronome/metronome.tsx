import * as React from "react";
import { useMemo, useState } from "react";
import {
  Measure,
  useMeasures,
  useMetronomeDimensions
} from "../../../../util/metronome-hooks";
import {
  useWindowDimensions,
  useWorkspaceLeft,
  useWorkspaceTime,
  useWorkspaceWidth
} from "../../../../util/workspace-hooks";
import { Bar } from "./bar";
import * as styles from "./metronome.less";
import { SectionHandle } from "./section-handle";
import Playhead from "../../../element/playhead";

interface RenderInfo {
  measures: {
    [num: number]: { measure: Measure; depth: number };
  };
  sections: {
    id: string;
    startTime: number;
    endTime: number;
    depth: number;
  }[];
}

export const Metronome: React.FC<{}> = () => {
  const leftFn = useWorkspaceLeft();
  const timeFn = useWorkspaceTime();
  const widthFn = useWorkspaceWidth();
  const { width } = useWindowDimensions();

  const [isHovered, setIsHovered] = useState(false);

  const timeBounds = useMemo(() => {
    const minScreenTime = timeFn(0);
    const maxScreenTime = timeFn(width);

    return [minScreenTime, maxScreenTime];
  }, [timeFn, width]);

  const {
    measureMap,
    sectionMap,
    preSectionId,
    insertedSectionIds,
    postSectionId
  } = useMeasures({
    start: timeBounds[0] - 5,
    end: timeBounds[1] + 5
  });

  const renderInfo: RenderInfo = useMemo(() => {
    const measureNums = Object.keys(measureMap).map(key => parseInt(key));
    const minMeasure = Math.min(...measureNums);
    const maxMeasure = Math.max(...measureNums);

    const sections: RenderInfo["sections"] = [];
    Object.keys(sectionMap).forEach(sectionId => {
      const ranges: number[][] = [];

      let insideRange = false;
      let curRangeStart = minMeasure;

      let n = minMeasure;
      while (n <= maxMeasure) {
        if (n === maxMeasure && insideRange) {
          ranges.push([curRangeStart, n]);
          insideRange = false;
        } else if (sectionMap[sectionId].measures.has(n)) {
          if (insideRange) {
            n++;
            continue;
          } else {
            curRangeStart = n;
            insideRange = true;
          }
        } else {
          if (insideRange) {
            ranges.push([curRangeStart, n]);
            insideRange = false;
          } else {
            n++;
            continue;
          }
        }

        n++;
      }

      let sectionDepth = 1;
      let parent = sectionMap[sectionId].parent;
      while (parent !== undefined) {
        sectionDepth++;
        parent = sectionMap[parent].parent;
      }
      if (sectionId === preSectionId || sectionId === postSectionId) {
        sectionDepth = 0;
      }

      ranges.forEach(range => {
        sections.push({
          id: sectionId,
          depth: sectionDepth,
          startTime: measureMap[range[0]].timeStart,
          endTime: measureMap[range[1]].timeStart
        });
      });
    });

    const measures: RenderInfo["measures"] = {};
    Object.keys(measureMap).forEach(n => {
      const num = parseInt(n);

      let depth = 1;
      const measureSection = sectionMap[measureMap[num].section.id];
      let parent = measureSection.parent;
      while (parent !== undefined) {
        depth++;
        parent = sectionMap[parent].parent;
      }
      if (
        measureSection.sectionId === preSectionId ||
        measureSection.sectionId === postSectionId
      ) {
        depth = 0;
      }

      measures[num] = {
        measure: measureMap[num],
        depth
      };
    });

    return { measures, sections };
  }, [measureMap, sectionMap, preSectionId, postSectionId]);

  const {
    barHeight,
    sectionHandleHeight,
    sectionHandleMargin,
    expandedSectionHandleHeight,
    expandedSectionHandleMargin
  } = useMetronomeDimensions();

  const gapWidth = useMemo(() => {
    const numGaps = Object.keys(measureMap).length - 1;
    return Math.max(4.0 / (numGaps / 5.0), 1.5);
  }, [measureMap]);

  const [maxDepth, setMaxDepth] = useState<number>(0);

  const children: JSX.Element[] = useMemo(() => {
    const elems: JSX.Element[] = [];

    renderInfo.sections.forEach(section => {
      if (section.depth !== 0) {
        const top =
          (section.depth - 1) *
          (isHovered
            ? expandedSectionHandleHeight + expandedSectionHandleMargin
            : sectionHandleHeight + sectionHandleMargin);
        elems.push(
          <SectionHandle
            key={`section${section.depth}${section.startTime}`}
            left={leftFn(section.startTime)}
            top={top}
            width={widthFn(section.endTime - section.startTime)}
            height={
              isHovered ? expandedSectionHandleHeight : sectionHandleHeight
            }
            margin={
              isHovered ? expandedSectionHandleMargin : sectionHandleMargin
            }
            depth={section.depth}
            gapWidth={gapWidth}
          ></SectionHandle>
        );
      }
    });

    Object.keys(renderInfo.measures).forEach(n => {
      const num = parseInt(n);
      const measure = measureMap[num];
      const depth = renderInfo.measures[num].depth;
      if (depth > maxDepth) setMaxDepth(depth);

      const top =
        depth *
        (isHovered
          ? expandedSectionHandleHeight + expandedSectionHandleMargin
          : sectionHandleHeight + sectionHandleMargin);

      const measureDuration =
        (60.0 / measure.section.bpm) * measure.section.beatsPerBar;
      elems.push(
        <Bar
          num={num}
          key={num}
          depth={renderInfo.measures[num].depth}
          left={leftFn(measure.timeStart)}
          top={top}
          width={widthFn(measureDuration)}
          bpm={measure.section.bpm}
          beats={measure.section.beatsPerBar}
          label={
            measure.section.startMeasure === measure.num && measure.section.name
          }
          gapWidth={gapWidth}
        >
          <Playhead
            containerStart={measure.timeStart}
            containerDuration={measureDuration}
          />
        </Bar>
      );
    });

    return elems;
  }, [
    renderInfo.sections,
    renderInfo.measures,
    leftFn,
    widthFn,
    isHovered,
    expandedSectionHandleHeight,
    sectionHandleHeight,
    expandedSectionHandleMargin,
    sectionHandleMargin,
    gapWidth,
    measureMap,
    maxDepth
  ]);

  const metronomeHeight = useMemo(() => {
    if (isHovered)
      return (
        barHeight +
        maxDepth * (expandedSectionHandleHeight + expandedSectionHandleMargin)
      );
    else {
      return barHeight + maxDepth * (sectionHandleHeight + sectionHandleMargin);
    }
  }, [
    isHovered,
    barHeight,
    expandedSectionHandleMargin,
    expandedSectionHandleHeight,
    sectionHandleMargin,
    sectionHandleHeight,
    maxDepth
  ]);

  return (
    <div
      className={styles["metronome"]}
      style={{ height: `${metronomeHeight}px` }}
      onMouseEnter={(): void => setIsHovered(true)}
      onMouseLeave={(): void => setIsHovered(false)}
    >
      {children}
    </div>
  );
};
