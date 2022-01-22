import * as React from "react";
import { mount } from "enzyme";
import {
  PlaybackContext,
  PlaybackContextData,
  PlaybackProvider
} from "../recording/playback-context";
import { useQuery } from "@apollo/client";
import { CabMode } from "../../../../state/apollotypes";
import { useIsEmpty } from "../../hooks/use-is-empty";

jest.mock("../../../../util/react-hooks");
jest.mock("@apollo/client");
jest.mock("../../hooks/use-is-empty", () => ({ useIsEmpty: jest.fn() }));

describe("PlaybackContext", () => {
  beforeEach(() => {
    (useIsEmpty as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockClear();
  });

  it("cabMode is empty if vamp is empty", () => {
    (useIsEmpty as jest.Mock).mockImplementation(() => true);
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        userInVamp: { cab: { mode: CabMode.STACK, start: 0, duration: 4 } }
      }
    }));

    let data: PlaybackContextData;

    mount(
      <PlaybackProvider>
        <PlaybackContext.Consumer>
          {(value): React.ReactNode => {
            data = value;
            return null;
          }}
        </PlaybackContext.Consumer>
      </PlaybackProvider>
    );

    expect(data.cabMode).toEqual(CabMode.INFINITE);
  });
});
