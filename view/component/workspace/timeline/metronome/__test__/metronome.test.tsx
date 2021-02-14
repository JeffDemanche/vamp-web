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
    mockUseCurrentVampId.mockReturnValue("6028409d2d028064e549c591");

    const mocks: ReadonlyArray<MockedResponse> = [
      {
        request: {
          query: METRONOME_QUERY,
          variables: { vampId: "6028409d2d028064e549c591" }
        },
        result: {
          data: {
            vamp: {
              sections: [
                {
                  id: "602840bb5060d329142c1971",
                  bpm: 120,
                  beatsPerBar: 4,
                  metronomeSound: "Hi-hat",
                  startMeasure: 0,
                  repetitions: 2,
                  subSections: []
                }
              ],
              forms: [
                {
                  preSection: { id: "602840bb5060d329142c1971" },
                  insertedSections: [],
                  postSection: { id: "602840c407b16913e9497061" }
                }
              ]
            }
          }
        }
      }
    ];

    const component = mount(
      <MockedProvider
        mocks={mocks}
        addTypename={true}
        defaultOptions={{ watchQuery: { fetchPolicy: "no-cache" } }}
      >
        <Metronome></Metronome>
      </MockedProvider>
    );

    await wait(0);

    expect(component.find(Bar).exists()).toBe(true);
  });
});
