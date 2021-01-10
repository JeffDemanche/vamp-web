import * as React from "react";
import { Metronome } from "../metronome";
import {
  MockedProvider as MockedProviderBroken,
  MockedResponse
} from "@apollo/client/testing";
import {
  MockedProviderProps,
  MockedProviderState
} from "@apollo/client/utilities/testing/mocking/MockedProvider";
import { METRONOME_QUERY } from "../../../../../util/metronome-hooks";
import { mount } from "enzyme";
import { Bar } from "../bar";
import { act } from "react-dom/test-utils";
import wait from "waait";

const MockedProvider = MockedProviderBroken as React.ComponentClass<
  MockedProviderProps,
  MockedProviderState
>;

const mockUseCurrentVampId = jest.fn();
jest.mock("../../../../../util/react-hooks", () => ({
  get useCurrentVampId() {
    return mockUseCurrentVampId;
  }
}));

describe("Metronome", () => {
  it("renders with default metronome settings", async () => {
    mockUseCurrentVampId.mockReturnValue("vamp_id");

    const mocks: MockedResponse[] = [
      {
        request: {
          query: METRONOME_QUERY,
          variables: { vampId: "vamp_id" }
        },
        result: {
          data: {
            vamp: {
              sections: [
                {
                  id: "pre_section_id",
                  bpm: 120,
                  beatsPerBar: 4,
                  metronomeSound: "Hi-hat",
                  startMeasure: null,
                  repetitions: null,
                  subSections: null
                }
              ],
              forms: [
                {
                  preSection: { id: "pre_section_id" },
                  insertedSections: [],
                  postSection: null
                }
              ]
            }
          }
        }
      }
    ];

    const component = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Metronome></Metronome>
      </MockedProvider>
    );

    await act(async () => {
      await wait(0);
    });

    expect(component.find(Bar).exists()).toBe(true);
  });
});
