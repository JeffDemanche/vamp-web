import * as React from "react";
import { mount } from "enzyme";
import {
  MetronomeContext,
  MetronomeContextData,
  MetronomeProvider
} from "../metronome-context";
import { useQuery } from "@apollo/client";

jest.mock("@apollo/client", () => ({
  ...(jest.requireActual("@apollo/client") as object),
  useQuery: jest.fn()
}));

describe("Metronome Context", () => {
  it("gets sectionIDs", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section2_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section3_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            }
          ],
          forms: [
            {
              preSection: { id: "section1_id" },
              insertedSections: [{ id: "section2_id" }],
              postSection: { id: "section3_id" }
            }
          ]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    expect(data.getSectionIds()).toMatchObject({
      preSectionId: "section1_id",
      insertedSectionIds: ["section2_id"],
      postSectionId: "section3_id"
    });
  });

  it("gets measures and sections for a metronome with just preSection", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            }
          ],
          forms: [{ preSection: { id: "section1_id" }, insertedSections: [] }]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    const measureMap = data.getMeasureMap({ start: -2, end: 2 });
    const sectionMap = data.getSectionMap({ start: -2, end: 2 });

    expect(measureMap[-3]).toBeUndefined();
    expect(measureMap[-2].timeStart).toEqual(-4);
    expect(measureMap[-1].timeStart).toEqual(-2);
    expect(measureMap[0].timeStart).toEqual(0);
    expect(measureMap[1].timeStart).toEqual(2);
    expect(measureMap[2]).toBeUndefined();

    expect(sectionMap["section1_id"]).not.toBeUndefined();
    expect(sectionMap["section1_id"].measures).toEqual(new Set([-2, -1, 0, 1]));
  });

  it("gets measures and sections for a metronome with preSection and insertedSections", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section2_id",
              name: "section",
              bpm: 180,
              beatsPerBar: 3,
              metronomeSound: "Hi-hat",
              startMeasure: 0,
              repetitions: 2
            }
          ],
          forms: [
            {
              preSection: { id: "section1_id" },
              insertedSections: [{ id: "section2_id" }]
            }
          ]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    const measureMap = data.getMeasureMap({ start: -1, end: 3 });
    const sectionMap = data.getSectionMap({ start: -1, end: 3 });

    expect(measureMap[-2]).toBeUndefined();
    expect(measureMap[-1].timeStart).toEqual(-2);
    expect(measureMap[-1].section.beatsPerBar).toEqual(4);
    expect(measureMap[-1].section.bpm).toEqual(120);
    expect(measureMap[0].timeStart).toEqual(0);
    expect(measureMap[0].section.beatsPerBar).toEqual(3);
    expect(measureMap[0].section.bpm).toEqual(180);
    expect(measureMap[1].timeStart).toEqual(1);
    expect(measureMap[1].section.beatsPerBar).toEqual(3);
    expect(measureMap[2].timeStart).toEqual(2);
    expect(measureMap[2].section.bpm).toEqual(120);
    expect(measureMap[2].section.beatsPerBar).toEqual(4);
    expect(measureMap[3]).toBeUndefined();

    expect(sectionMap["section1_id"]).not.toBeUndefined();
    expect(sectionMap["section1_id"].measures).toEqual(new Set([-1, 2]));
    expect(sectionMap["section2_id"]).not.toBeUndefined();
    expect(sectionMap["section2_id"].measures).toEqual(new Set([0, 1]));
  });

  it("gets measures and sections for a metronome with preSection and postSection", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section2_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 3,
              metronomeSound: "Hi-hat",
              startMeasure: 2
            }
          ],
          forms: [
            {
              preSection: { id: "section1_id" },
              insertedSections: [],
              postSection: { id: "section2_id" }
            }
          ]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    const measureMap = data.getMeasureMap({ start: 0, end: 6 });
    const sectionMap = data.getSectionMap({ start: 0, end: 6 });

    expect(measureMap[-2]).toBeUndefined();
    expect(measureMap[-1].section.beatsPerBar).toEqual(4);
    expect(measureMap[0].section.beatsPerBar).toEqual(4);
    expect(measureMap[1].section.beatsPerBar).toEqual(4);
    // Post section
    expect(measureMap[2].section.beatsPerBar).toEqual(3);
    expect(measureMap[3].section.beatsPerBar).toEqual(3);
    expect(measureMap[4]).toBeUndefined();

    expect(sectionMap["section1_id"].measures).toEqual(new Set([-1, 0, 1]));
    expect(sectionMap["section2_id"].measures).toEqual(new Set([2, 3]));
  });

  it("gets measures and sections for a metronome with a nested insertedSection", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section2_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 3,
              metronomeSound: "Hi-hat",
              startMeasure: 0,
              repetitions: 2,
              subSections: [{ id: "section3_id" }]
            },
            {
              id: "section3_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 2,
              metronomeSound: "Hi-hat",
              startMeasure: 2,
              repetitions: 2
            }
          ],
          forms: [
            {
              preSection: { id: "section1_id" },
              insertedSections: [{ id: "section2_id" }]
            }
          ]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    const measureMap = data.getMeasureMap({ start: -1, end: 10 });
    const sectionMap = data.getSectionMap({ start: -1, end: 10 });

    expect(measureMap[0].timeStart).toEqual(0);
    expect(measureMap[0].section.beatsPerBar).toEqual(3);
    expect(measureMap[1].timeStart).toEqual(1.5);
    expect(measureMap[1].section.beatsPerBar).toEqual(3);
    // Nested sections
    expect(measureMap[2].timeStart).toEqual(3);
    expect(measureMap[2].section.beatsPerBar).toEqual(2);
    expect(measureMap[3].timeStart).toEqual(4);
    expect(measureMap[3].section.beatsPerBar).toEqual(2);

    expect(measureMap[4].timeStart).toEqual(5);
    expect(measureMap[4].section.beatsPerBar).toEqual(3);
    expect(measureMap[5].timeStart).toEqual(6.5);
    expect(measureMap[5].section.beatsPerBar).toEqual(3);
    expect(measureMap[6].timeStart).toEqual(8);
    expect(measureMap[6].section.beatsPerBar).toEqual(2);
    expect(measureMap[7].timeStart).toEqual(9);
    expect(measureMap[7].section.beatsPerBar).toEqual(2);

    // Back to Pre Section
    expect(measureMap[8].timeStart).toEqual(10);
    expect(measureMap[8].section.beatsPerBar).toEqual(4);

    expect(sectionMap["section1_id"].measures).toEqual(new Set([-1, 8]));
    expect(sectionMap["section2_id"].measures).toEqual(
      new Set([0, 1, 2, 3, 4, 5, 6, 7])
    );
    expect(sectionMap["section3_id"].measures).toEqual(new Set([2, 3, 6, 7]));
    expect(sectionMap["section3_id"].parent).toEqual("section2_id");
  });

  it("gets truncated end time with single preSection", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 140,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            }
          ],
          forms: [{ preSection: { id: "section1_id" }, insertedSections: [] }]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    const oneBeat = 0.42857142857;

    expect(data.truncateTime(0)).toBeCloseTo(0);
    expect(data.truncateTime(2)).toBeCloseTo(oneBeat * 4);
    expect(data.truncateTime(oneBeat)).toBeCloseTo(0);
    expect(data.truncateTime(oneBeat + 0.2)).toBeCloseTo(oneBeat);
    expect(data.truncateTime(-0.01)).toBeCloseTo(-oneBeat);
    expect(data.truncateTime(-0.43)).toBeCloseTo(-2 * oneBeat);
  });

  it("gets truncated end time with inserted section", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section2_id",
              name: "section",
              bpm: 140,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 2,
              repetitions: 2
            }
          ],
          forms: [
            {
              preSection: { id: "section1_id" },
              insertedSections: [{ id: "section2_id" }]
            }
          ]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    const oneBeat = 0.42857142857;

    expect(data.truncateTime(3.6)).toBeCloseTo(3.5);
    expect(data.truncateTime(4)).toBeCloseTo(4);
    expect(data.truncateTime(4.5)).toBeCloseTo(4 + oneBeat);
    expect(data.truncateTime(5)).toBeCloseTo(4 + 2 * oneBeat);
  });

  it("gets snap to beat time", () => {
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        vamp: {
          sections: [
            {
              id: "section1_id",
              name: "section",
              bpm: 120,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 0
            },
            {
              id: "section2_id",
              name: "section",
              bpm: 140,
              beatsPerBar: 4,
              metronomeSound: "Hi-hat",
              startMeasure: 2,
              repetitions: 2
            }
          ],
          forms: [
            {
              preSection: { id: "section1_id" },
              insertedSections: [{ id: "section2_id" }]
            }
          ]
        }
      }
    }));

    let data: MetronomeContextData;

    mount(
      <MetronomeProvider>
        <MetronomeContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </MetronomeContext.Consumer>
      </MetronomeProvider>
    );

    expect(data.snapToBeat(-1.1)).toEqual(-1);
    expect(data.snapToBeat(0)).toEqual(0);
    expect(data.snapToBeat(0.22)).toEqual(0);
    expect(data.snapToBeat(-0.01)).toEqual(0);
    expect(data.snapToBeat(-0.25)).toEqual(-0.5);
    expect(data.snapToBeat(0.5)).toEqual(0.5);
    expect(data.snapToBeat(0.48)).toEqual(0.5);

    // after time change one beat is 0.42857142857 seconds
    expect(data.snapToBeat(4)).toEqual(4);
    expect(data.snapToBeat(4.3)).toBeCloseTo(4.42857142857);
    expect(data.snapToBeat(4.5)).toBeCloseTo(4.42857142857);
    expect(data.snapToBeat(4.8)).toBeCloseTo(4.85714285714);
  });
});
