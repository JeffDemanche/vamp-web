import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { MetronomeQuery } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";

export const useMetronomeDimensions = (): {
  barHeight: number;
  sectionHandleHeight: number;
  sectionHandleMargin: number;
  expandedSectionHandleHeight: number;
  expandedSectionHandleMargin: number;
} => {
  const vals = {
    barHeight: 30,
    sectionHandleHeight: 0,
    sectionHandleMargin: 0,
    expandedSectionHandleHeight: 8,
    expandedSectionHandleMargin: 2
  };

  return vals;
};

export const METRONOME_QUERY = gql`
  query MetronomeQuery($vampId: ID!) {
    vamp(id: $vampId) {
      sections {
        id
        name
        bpm
        beatsPerBar
        metronomeSound
        startMeasure
        repetitions
        subSections {
          id
        }
      }
      forms {
        preSection {
          id
        }
        insertedSections {
          id
        }
        postSection {
          id
        }
      }
    }
  }
`;

export interface MeasureSection {
  id: string;
  bpm: number;
  beatsPerBar: number;
  startMeasure: number;
  repetitions: number;
  metronomeSound: string;
  name?: string;
  insertedSection?: boolean;
}

export interface Measure {
  num: number;
  timeStart: number;
  section: MeasureSection;
}

interface Section {
  sectionId: string;
  measures: Set<number>;
  parent: string;
  section: MeasureSection;
  subSections: Section[];
}

/**
 * Type for the whole context provider value.
 */
export interface MetronomeContextData {
  formData?: MetronomeQuery["vamp"];

  /**
   * Gets a map of ordinal measure numbers to their measure data in the time
   * range between start and end.
   */
  getMeasureMap: (args: {
    formIndex?: number;
    start: number;
    end: number;
  }) => { [no: number]: Measure };

  /**
   * Gets a map of section IDs to their section data.
   */
  getSectionMap: (args: {
    formIndex?: number;
    start: number;
    end: number;
  }) => {
    [sectionId: string]: Section;
  };

  getSectionIds: () => {
    preSectionId: string;
    insertedSectionIds: string[];
    postSectionId?: string;
  };

  /**
   * Given a time (namely the end time of a recording), get the time of the
   * closest previous beat marker to that time.
   */
  truncateEndOfRecording: (time: number, formIndex?: number) => number;
}

export const MetronomeContext = React.createContext<MetronomeContextData>(null);

interface MetronomeProviderProps {
  children: React.ReactChild | React.ReactChildren;
}

export const MetronomeProvider: React.FC = ({
  children
}: MetronomeProviderProps) => {
  const vampId = useCurrentVampId();

  const { data } = useQuery<MetronomeQuery>(METRONOME_QUERY, {
    variables: { vampId }
  });

  // An object where the keys are section IDs on the Vamp and the values are the
  // section objects.
  const sections = useMemo(() => {
    const newMap: {
      [key: string]: MetronomeQuery["vamp"]["sections"][number];
    } = {};
    data.vamp.sections.forEach(section => (newMap[section.id] = section));
    return newMap;
  }, [data.vamp.sections]);

  const getMeasureMap = useCallback(
    ({
      formIndex,
      start,
      end
    }: {
      formIndex?: number;
      start: number;
      end: number;
    }) => {
      if (start > end || !data.vamp.forms[formIndex || 0])
        throw new Error("Bad input for getting measures");

      const form = data.vamp.forms[formIndex || 0];

      // A map of inserted measure numbers to the ID of the section they're in.
      // Maps measure numbers of inserted sections and post section to section
      // ID.
      const measureNos = new Map<number, string>();

      // Inserts measures into the map using recursive search for subSections.
      const addSectionRecursive = (
        section: MetronomeQuery["vamp"]["sections"][number],
        relativeStartMeasure: number
      ): number => {
        if (section.subSections && section.subSections.length > 0) {
          let mutableMeasureCounter = relativeStartMeasure;
          // We don't directly know how long the section is so we have to count.
          let measureCount = 0;
          for (let rep = 0; rep < section.repetitions; rep++) {
            mutableMeasureCounter = relativeStartMeasure + measureCount;

            const subStart = section.subSections.reduce<number>(
              (acc, cur) =>
                sections[cur.id].startMeasure > acc
                  ? sections[cur.id].startMeasure
                  : acc,
              0
            );
            for (let leading = 0; leading < subStart; leading++) {
              measureNos.set(mutableMeasureCounter + leading, section.id);
            }
            measureCount += subStart;
            section.subSections.forEach(subSection => {
              const subLength = addSectionRecursive(
                sections[subSection.id],
                mutableMeasureCounter + sections[subSection.id].startMeasure
              );
              measureCount += subLength;
            });
          }
          return measureCount;
        } else {
          for (let rep = 0; rep < section.repetitions; rep++) {
            measureNos.set(relativeStartMeasure + rep, section.id);
          }
          return section.repetitions;
        }
      };

      if (form.insertedSections) {
        form.insertedSections.forEach(section => {
          addSectionRecursive(
            sections[section.id],
            sections[section.id].startMeasure
          );
        });
      }

      const postSectionStartMeasure =
        form.postSection && sections[form.postSection.id].startMeasure;

      const measureMap: { [no: number]: Measure } = {};

      // Counting up from measure 0, add measures to the new fleshed out map until
      // the measure time is outside of the bound argument. If a measure isn't in
      // the first map, that means we should fill it in using the preSection data.
      let measureCounter = 0;
      let timeCounter = 0;
      while (timeCounter <= end) {
        if (measureNos.has(measureCounter)) {
          const section = sections[measureNos.get(measureCounter)];
          const measureDuration = (60.0 / section.bpm) * section.beatsPerBar;
          // Only actually add the measure if it's after the start bound.
          if (timeCounter + measureDuration >= start) {
            measureMap[measureCounter] = {
              num: measureCounter,
              timeStart: timeCounter,
              section: { ...sections[section.id], insertedSection: true }
            };
          }
          timeCounter += measureDuration;
          measureCounter++;
        } else {
          const sectionId =
            postSectionStartMeasure === null ||
            postSectionStartMeasure === undefined ||
            postSectionStartMeasure > measureCounter
              ? form.preSection.id
              : form.postSection.id;
          const section = sections[sectionId];
          const measureDuration = (60.0 / section.bpm) * section.beatsPerBar;
          if (timeCounter + measureDuration >= start) {
            measureMap[measureCounter] = {
              num: measureCounter,
              timeStart: timeCounter,
              section: { ...sections[section.id], insertedSection: false }
            };
          }
          timeCounter += measureDuration;
          measureCounter++;
        }
      }

      // Do the same as above, now counting down from 0 into negative measures.
      measureCounter = 0;
      timeCounter = 0;
      while (timeCounter >= start) {
        if (measureNos.has(measureCounter - 1)) {
          const section = sections[measureNos.get(measureCounter - 1)];
          const measureDuration = (60.0 / section.bpm) * section.beatsPerBar;
          if (timeCounter - measureDuration <= end) {
            measureMap[measureCounter - 1] = {
              num: measureCounter - 1,
              timeStart: timeCounter - measureDuration,
              section: { ...sections[section.id], insertedSection: true }
            };
          }
          measureCounter--;
          timeCounter -= measureDuration;
        } else {
          const sectionId =
            postSectionStartMeasure === null ||
            postSectionStartMeasure === undefined ||
            postSectionStartMeasure > measureCounter - 1
              ? form.preSection.id
              : form.postSection.id;
          const section = sections[sectionId];
          const measureDuration = (60.0 / section.bpm) * section.beatsPerBar;
          if (timeCounter - measureDuration <= end) {
            measureMap[measureCounter - 1] = {
              num: measureCounter - 1,
              timeStart: timeCounter - measureDuration,
              section: { ...sections[section.id], insertedSection: false }
            };
          }
          measureCounter--;
          timeCounter -= measureDuration;
        }
      }

      return measureMap;
    },
    [data.vamp.forms, sections]
  );

  const getSectionMap = useCallback(
    ({
      formIndex,
      start,
      end
    }: {
      formIndex?: number;
      start: number;
      end: number;
    }) => {
      if (start > end || !data.vamp.forms[formIndex || 0])
        throw new Error("Bad input for getting sections");

      // Maps section IDs to their parents. No entries for root sections.
      const sectionParents: { [sectionId: string]: string } = {};
      Object.keys(sections).forEach(sectionId => {
        if (
          sections[sectionId].subSections &&
          sections[sectionId].subSections.length > 0
        ) {
          sections[sectionId].subSections.forEach(ss => {
            sectionParents[ss.id] = sectionId;
          });
        }
      });

      // Gets the "ancestors" of a given section to the root as a string array.
      const getAllSections = (sectionId: string): string[] => {
        const sections: string[] = [];
        let currentSection = sectionId;

        while (currentSection) {
          sections.push(currentSection);
          currentSection = sectionParents[currentSection];
        }
        return sections;
      };

      const measureMap = getMeasureMap({ formIndex, start, end });

      const sectionsToMeasures: { [sectionId: string]: Set<number> } = {};
      Object.keys(measureMap).forEach(measure => {
        // Array of all sections this measure belongs to.
        const measureSections = getAllSections(
          measureMap[parseInt(measure)].section.id
        );
        measureSections.forEach(ms => {
          if (sectionsToMeasures[ms]) {
            sectionsToMeasures[ms].add(parseInt(measure));
          } else {
            sectionsToMeasures[ms] = new Set([parseInt(measure)]);
          }
        });
      });

      const sectionMap: { [sectionId: string]: Section } = {};
      const allSections = Object.keys(sections);
      const treeRecur = (sectionId: string): Section => {
        const section = sections[sectionId];
        if (!section.subSections || section.subSections.length === 0) {
          return {
            sectionId: section.id,
            measures: sectionsToMeasures[section.id] || new Set<number>(),
            parent: sectionParents[section.id],
            section: { ...sections[section.id] },
            subSections: []
          };
        } else {
          return {
            sectionId: section.id,
            measures: sectionsToMeasures[section.id] || new Set<number>(),
            parent: sectionParents[section.id],
            section: { ...sections[section.id] },
            subSections: section.subSections.map(ss => treeRecur(ss.id))
          };
        }
      };
      allSections.forEach(s => (sectionMap[s] = treeRecur(s)));

      return sectionMap;
    },
    [getMeasureMap, sections]
  );

  const getSectionIds = useCallback(
    (formIndex?: number) => {
      const postSection = data.vamp.forms[formIndex || 0].postSection;

      return {
        preSectionId: data.vamp.forms[formIndex || 0].preSection.id,
        insertedSectionIds: data.vamp.forms[
          formIndex || 0
        ].insertedSections.map(s => s.id),
        postSectionId: postSection && postSection.id
      };
    },
    [data.vamp.forms]
  );

  const truncateEndOfRecording = useCallback(
    (time: number, formIndex?: number) => {
      // Gets all the beat start times for a measure.
      const getMeasureBeats = (measure: Measure): number[] => {
        const beats = [];
        for (let i = 0; i < measure.section.beatsPerBar; i++) {
          beats.push(measure.timeStart + i * (60 / measure.section.bpm));
        }
        return beats;
      };

      const measureMap = getMeasureMap({ formIndex, start: time, end: time });
      const keys: number[] = Object.keys(measureMap).map(Number);
      let timeOfPreviousBeat = Number.NEGATIVE_INFINITY;
      keys.forEach(key => {
        getMeasureBeats(measureMap[key]).forEach(beatTime => {
          if (beatTime > timeOfPreviousBeat && beatTime <= time) {
            timeOfPreviousBeat = beatTime;
          }
        });
      });
      return timeOfPreviousBeat;
    },
    [getMeasureMap]
  );

  return (
    <MetronomeContext.Provider
      value={{
        formData: data.vamp,
        getMeasureMap,
        getSectionMap,
        getSectionIds,
        truncateEndOfRecording
      }}
    >
      {children}
    </MetronomeContext.Provider>
  );
};
