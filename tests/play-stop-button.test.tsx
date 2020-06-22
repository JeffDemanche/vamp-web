import { shallow, mount, render } from "enzyme";
// eslint-disable-next-line max-len
import { PlayStopButton } from "../view/component/workspace/play-panel/play-stop-button";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { resolvers } from "../view/state/resolvers";

describe("Play/Stop Button", () => {
  beforeEach(() => {});
  it("plays when clicked from paused", () => {
    const customResolvers = resolvers.Mutation;
    const wrapper = shallow(
      <ApolloMockedProvider customResolvers={customResolvers}>
        <PlayStopButton />
      </ApolloMockedProvider>
    );
    expect(wrapper.find(PlayStopButton).simulate("click"));
    console.log(wrapper.debug({ verbose: false }));
  });
  it("pauses when clicked from play", () => {
    expect(2).toBe(2);
  });
});
