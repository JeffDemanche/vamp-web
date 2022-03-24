import * as React from "react";
import { useContext, useMemo, useState } from "react";
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
import {
  Measure,
  MetronomeContext,
  useMetronomeDimensions
} from "../../context/metronome-context";

interface MetronomeHighlightedElement {
  sectionId?: string;
  measureNum?: number;
}

export const MetronomeMenuContext = React.createContext<{
  metronomeMenuOpen: MetronomeHighlightedElement;
  setOpenBarMenu: (num: number) => void;
  setOpenSectionMenu: (sectionId: string) => void;
}>({
  metronomeMenuOpen: {},
  setOpenBarMenu: () => {},
  setOpenSectionMenu: () => {}
});

interface RenderInfo {
  measures: {
    [num: number]: { measure: Measure; depth: number };
  };
  sections: {
    id: string;
    name?: string;
    startTime: number;
    measures: Set<number>;
    parent: string;
    subSections: string[];
    endTime: number;
    depth: number;
  }[];
}

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

  const start = timeBounds[0] - 5;
  const end = timeBounds[1] + 5;

  const { getMeasureMap, getSectionMap, getSectionIds } = useContext(
    MetronomeContext
  );

  const measureMap = getMeasureMap({ start, end });
  const sectionMap = getSectionMap({ start, end });
  const { preSectionId, postSectionId } = getSectionIds();

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

      const subSections = sectionMap[sectionId].subSections.map(
        sub => sub.sectionId
      );
      const measures = sectionMap[sectionId].measures;
      const name = sectionMap[sectionId].section.name;

      ranges.forEach(range => {
        sections.push({
          id: sectionId,
          depth: sectionDepth,
          parent,
          subSections,
          measures,
          name,
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

  // This contains info about whatever bar or section the menu is open over, or
  // is an empty object if a menu isn't open over the metronome.
  const [metronomeMenuOpen, setMetronomeMenuOpen] = useState<
    MetronomeHighlightedElement
  >({});
  const setOpenBarMenu = (num: number): void => {
    setMetronomeMenuOpen(menuOpen => ({ ...menuOpen, measureNum: num }));
  };
  const setOpenSectionMenu = (sectionId: string): void => {
    setMetronomeMenuOpen(menuOpen => ({ ...menuOpen, sectionId }));
  };

  const [isHovered, setIsHovered] = useState(false);

  const metronomeExpanded =
    metronomeMenuOpen.measureNum || metronomeMenuOpen.sectionId || isHovered;

  const [hoveredSection, setHoveredSection] = useState<
    RenderInfo["sections"][number]
  >(null);
  const [hoveredBar, setHoveredBar] = useState<
    RenderInfo["measures"][number]["measure"]
  >(null);

  // Calculates all section ids which are children of hoveredSection. If
  // hoveredSection is null, returns empty array.
  const highlightedSectionIds: Set<string> = useMemo(() => {
    if (!hoveredSection) return new Set();

    const highlighted = new Set<string>();
    let sectionLevel = [hoveredSection];
    while (sectionLevel && sectionLevel.length > 0) {
      const nextSectionLevel: typeof hoveredSection[] = [];
      sectionLevel.forEach(sectionInLevel => {
        sectionInLevel.subSections.forEach(subSection =>
          nextSectionLevel.push(
            renderInfo.sections.find(riSec => riSec.id === subSection)
          )
        );
        highlighted.add(sectionInLevel.id);
      });
      sectionLevel = nextSectionLevel;
    }
    return highlighted;
  }, [hoveredSection, renderInfo.sections]);

  const highlightedBarNums: Set<number> = useMemo(() => {
    if (hoveredSection || metronomeMenuOpen.sectionId) {
      return (
        hoveredSection?.measures ??
        renderInfo.sections.find(s => s.id === metronomeMenuOpen.sectionId)
          .measures
      );
    } else if (hoveredBar) {
      return new Set<number>([hoveredBar.num]);
    } else {
      return new Set();
    }
  }, [
    hoveredBar,
    hoveredSection,
    metronomeMenuOpen.sectionId,
    renderInfo.sections
  ]);

  const {
    barHeight,
    sectionHandleHeight,
    sectionHandleMargin,
    expandedSectionHandleHeight,
    expandedSectionHandleMargin
  } = useMetronomeDimensions();

  const [maxDepth, setMaxDepth] = useState<number>(0);

  const children: JSX.Element[] = useMemo(() => {
    const elems: JSX.Element[] = [];

    renderInfo.sections.forEach(section => {
      if (section.depth !== 0) {
        const top =
          (section.depth - 1) *
          (metronomeExpanded
            ? expandedSectionHandleHeight
            : sectionHandleHeight);
        elems.push(
          <SectionHandle
            id={section.id}
            key={`section${section.depth}${section.startTime}`}
            name={section.name}
            left={leftFn(section.startTime)}
            top={top}
            width={widthFn(section.endTime - section.startTime)}
            height={
              metronomeExpanded
                ? expandedSectionHandleHeight
                : sectionHandleHeight
            }
            highlighted={highlightedSectionIds.has(section.id)}
            onMouseEnter={(): void => setHoveredSection(section)}
            onMouseLeave={(): void => setHoveredSection(null)}
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
        (metronomeExpanded
          ? expandedSectionHandleHeight
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
          highlighted={highlightedBarNums.has(num)}
          onMouseEnter={(): void => setHoveredBar(measure)}
          onMouseLeave={(): void => setHoveredBar(null)}
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
    metronomeExpanded,
    expandedSectionHandleHeight,
    sectionHandleHeight,
    leftFn,
    widthFn,
    highlightedSectionIds,
    measureMap,
    maxDepth,
    sectionHandleMargin,
    highlightedBarNums
  ]);

  const metronomeHeight = useMemo(() => {
    if (metronomeExpanded)
      return (
        barHeight +
        maxDepth * (expandedSectionHandleHeight + expandedSectionHandleMargin)
      );
    else {
      return barHeight + maxDepth * (sectionHandleHeight + sectionHandleMargin);
    }
  }, [
    metronomeExpanded,
    barHeight,
    expandedSectionHandleMargin,
    expandedSectionHandleHeight,
    sectionHandleMargin,
    sectionHandleHeight,
    maxDepth
  ]);

  return (
    <MetronomeMenuContext.Provider
      value={{ metronomeMenuOpen, setOpenBarMenu, setOpenSectionMenu }}
    >
      <div
        className={styles["metronome"]}
        style={{ height: `${metronomeHeight}px` }}
        onMouseEnter={(): void => setIsHovered(true)}
        onMouseLeave={(): void => setIsHovered(false)}
      >
        {children}
      </div>
    </MetronomeMenuContext.Provider>
  );
};
