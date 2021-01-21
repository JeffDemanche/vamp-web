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

    const mocks: ReadonlyArray<MockedResponse> = [
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
                  startMeasure: 0,
                  repetitions: 2,
                  subSections: [],
                  __typename: "Section"
                }
              ],
              forms: [
                {
                  preSection: { id: "pre_section_id" },
                  insertedSections: [],
                  postSection: { id: "post_section_id" },
                  __typename: "Form"
                }
              ],
              __typename: "Vamp"
            }
          }
        }
      }
    ];

    const component = mount(
      <MockedProvider mocks={mocks} addTypename={true}>
        <Metronome></Metronome>
      </MockedProvider>
    );

    await wait(0);

    expect(component.find(Bar).exists()).toBe(true);
  });
});
