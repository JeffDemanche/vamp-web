import { shallow, mount, render } from "enzyme";
// eslint-disable-next-line max-len
import { PlayStopButton } from "../view/component/workspace/play-panel/play-stop-button";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { PLAY, PAUSE } from "../view/state/mutations";

describe("Play/Stop Button", () => {
  beforeEach(() => {});
  it("pauses when clicked from play", () => {
    const customResolvers = { Mutation: () => PLAY };
    const wrapper = shallow(
      <ApolloMockedProvider customResolvers={customResolvers}>
        <PlayStopButton />
      </ApolloMockedProvider>
    );
    console.log(wrapper.debug({ verbose: false }));
  });
  it("plays when clicked from pause", () => {
    const customResolvers = { Mutation: () => PAUSE };
    expect(2).toBe(2);
  });
});
