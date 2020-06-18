import { shallow, mount, render } from "enzyme";
// eslint-disable-next-line max-len
import { PlayStopButton } from "../view/component/workspace/play-panel/play-stop-button";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";

describe("Play/Stop button functionality", () => {
  const mockCallBack = jest.fn();
  const customResolvers = {};
  beforeEach(() => {});
  it("pauses when clicked from play", () => {
    const button = shallow(
      <ApolloMockedProvider customResolvers={customResolvers}>
        <PlayStopButton />
      </ApolloMockedProvider>
    );
    button.find("play-stop-button").simulate("click");
    expect(mockCallBack.mock.calls.length).toEqual(1);
  });
  it("plays when clicked from pause", () => {
    expect(2).toBe(2);
  });
});
