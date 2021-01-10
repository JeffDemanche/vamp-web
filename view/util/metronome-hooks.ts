import { gql, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import {
  MetronomeQuery,
  MetronomeQuery_vamp_sections
} from "../state/apollotypes";
import { useCurrentVampId } from "./react-hooks";

export const METRONOME_QUERY = gql`
  query MetronomeQuery($vampId: ID!) {
    vamp(id: $vampId) @client {
      sections {
        id
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

interface MeasureSection {
  id: string;
  bpm: number;
  beatsPerBar: number;
  metronomeSound: string;
  label?: string;
}

export class Measure {
  private _num: number;
  private _timeStart: number;
  private _section: MeasureSection;

  constructor({
    num,
    timeStart,
    section
  }: {
    num: number;
    timeStart: number;
    section: MeasureSection;
  }) {
    this._num = num;
    this._timeStart = timeStart;
    this._section = section;
  }

  get num(): number {
    return this._num;
  }

  get timeStart(): number {
    return this._timeStart;
  }

  get section(): MeasureSection {
    return this._section;
  }
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
}): { [no: number]: Measure } => {
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
    ): void => {
      if (section.subSections) {
        section.subSections.forEach(subSection => {
          addSectionRecursive(
            sections[subSection.id],
            relativeStartMeasure + sections[subSection.id].startMeasure
          );
        });
      } else {
        for (let rep = 0; rep < section.repetitions; rep++) {
          measureNos.set(
            relativeStartMeasure + section.startMeasure + rep,
            section.id
          );
        }
      }
    };

    if (form.insertedSections) {
      form.insertedSections.forEach(section => {
        addSectionRecursive(sections[section.id], 0);
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
          measureMap[measureCounter] = new Measure({
            num: measureCounter,
            timeStart: timeCounter,
            section: sections[section.id]
          });
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
          measureMap[measureCounter] = new Measure({
            num: measureCounter,
            timeStart: timeCounter,
            section: sections[section.id]
          });
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
          measureMap[measureCounter - 1] = new Measure({
            num: measureCounter - 1,
            timeStart: timeCounter - measureDuration,
            section: sections[section.id]
          });
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
          measureMap[measureCounter - 1] = new Measure({
            num: measureCounter - 1,
            timeStart: timeCounter - measureDuration,
            section: sections[section.id]
          });
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

  return measureMap;
};
