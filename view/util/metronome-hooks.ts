import { gql, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import {
  MetronomeQuery,
  MetronomeQuery_vamp_sections
} from "../state/apollotypes";
import { useCurrentVampId } from "./react-hooks";

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

interface SectionMap {
  sectionId: string;
  measures: Set<number>;
  parent: string;
  section: MeasureSection;
  subSections: SectionMap[];
}

/**
 * Computes a map of measures complete with time data. The map format is
 * <measure no, measure object>. See the Measure class for what data that object
 * contains.
 *
 * @param start Compute measures which are at least partially after this time in
 * seconds.
 * @param end See start
 * @param form Optional, specify form index other than 0.
 */
export const useMeasures = ({
  start,
  end,
  formIndex
}: {
  start: number;
  end: number;
  formIndex?: number;
}): {
  measureMap: { [no: number]: Measure };
  sectionMap: {
    [sectionId: string]: SectionMap;
  };
  preSectionId: string;
  insertedSectionIds: string[];
  postSectionId?: string;
} => {
  const vampId = useCurrentVampId();

  const { data, loading, error } = useQuery<MetronomeQuery>(METRONOME_QUERY, {
    variables: { vampId }
  });

  const form = data.vamp.forms[formIndex || 0];

  // An object where the keys are section IDs on the Vamp and the values are the
  // section objects.
  const sections: {
    [key: string]: MetronomeQuery_vamp_sections;
  } = useMemo(() => {
    const sections: {
      [key: string]: MetronomeQuery_vamp_sections;
    } = {};
    data.vamp.sections.forEach(section => (sections[section.id] = section));
    return sections;
  }, [data.vamp.sections]);

  const postSectionStartMeasure =
    form.postSection && sections[form.postSection.id].startMeasure;

  // A map of inserted measure numbers to the ID of the section they're in.
  const measureNos = useMemo(() => {
    // Maps measure numbers of inserted sections and post section to section ID.
    const measureNos = new Map<number, string>();

    // Inserts measures into the map using recursive search for subSections.
    const addSectionRecursive = (
      section: typeof data.vamp.sections[0],
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

    return measureNos;
  }, [data, form.insertedSections, sections]);

  const measureMap = useMemo(() => {
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
  }, [
    end,
    start,
    measureNos,
    sections,
    postSectionStartMeasure,
    form.preSection.id,
    form.postSection
  ]);

  // Maps section IDs to their parents. No entries for root sections.
  const sectionParents = useMemo(() => {
    const map: { [sectionId: string]: string } = {};
    Object.keys(sections).forEach(sectionId => {
      if (
        sections[sectionId].subSections &&
        sections[sectionId].subSections.length > 0
      ) {
        sections[sectionId].subSections.forEach(ss => {
          map[ss.id] = sectionId;
        });
      }
    });
    return map;
  }, [sections]);

  // Gets the "ancestors" of a given section to the root as a string array.
  const getAllSections = useCallback(
    (sectionId: string) => {
      const sections: string[] = [];
      let currentSection = sectionId;

      while (currentSection) {
        sections.push(currentSection);
        currentSection = sectionParents[currentSection];
      }
      return sections;
    },
    [sectionParents]
  );

  const sectionsToMeasures = useMemo(() => {
    const rev: { [sectionId: string]: Set<number> } = {};
    Object.keys(measureMap).forEach(measure => {
      // Array of all sections this measure belongs to.
      const measureSections = getAllSections(
        measureMap[parseInt(measure)].section.id
      );
      measureSections.forEach(ms => {
        if (rev[ms]) {
          rev[ms].add(parseInt(measure));
        } else {
          rev[ms] = new Set([parseInt(measure)]);
        }
      });
    });
    return rev;
  }, [measureMap, getAllSections]);

  const sectionMap = useMemo(() => {
    const map: { [sectionId: string]: SectionMap } = {};
    const allSections = Object.keys(sections);
    const treeRecur = (sectionId: string): SectionMap => {
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
    allSections.forEach(s => (map[s] = treeRecur(s)));
    return map;
  }, [sections, sectionsToMeasures, sectionParents]);

  const postSection = data.vamp.forms[formIndex || 0].postSection;

  return {
    measureMap,
    sectionMap,
    preSectionId: data.vamp.forms[formIndex || 0].preSection.id,
    insertedSectionIds: data.vamp.forms[formIndex || 0].insertedSections.map(
      s => s.id
    ),
    postSectionId: postSection && postSection.id
  };
};

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
