import * as React from "react";
import { Metronome } from "../metronome";
import { METRONOME_QUERY } from "../../../../../util/metronome-hooks";

export default { title: "Metronome" };

export const defaultMetronome = () => <Metronome></Metronome>;

defaultMetronome.parameters = {
  apolloClient: {
    mocks: [
      {
        request: { query: METRONOME_QUERY, variables: { vampId: "vamp" } },
        result: {
          data: {
            vamp: {
              sections: [
                {
                  id: "pre_section",
                  bpm: 120,
                  beatsPerBar: 4,
                  metronomeSound: "Hi-hat",
                  startMeasure: 0,
                  repetitions: null,
                  subSections: null,
                  vamp: "vamp"
                }
              ],
              forms: [
                {
                  preSection: { id: "pre_section" },
                  insertedSections: [],
                  postSection: null
                }
              ]
            }
          }
        }
      }
    ]
  }
};

defaultMetronome.story = {
  name: "Default Metronome"
};
