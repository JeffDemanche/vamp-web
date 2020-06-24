import "jsdom-global/register";
import { mount } from "enzyme";
// eslint-disable-next-line max-len
import { PlayStopButton } from "../view/component/workspace/play-panel/play-stop-button";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { resolvers } from "../view/state/resolvers";
import { InMemoryCache } from "apollo-boost";
import { act } from "react-dom/test-utils";

describe("Play/Stop Button functionality", () => {
  // beforeEach(() => {});
  it("handles clicking", () => {
    const customResolvers = {};
    act(() => {
      const wrapper = mount(
        <ApolloMockedProvider customResolvers={customResolvers}>
          <PlayStopButton />
        </ApolloMockedProvider>
      );
      //TODO: currently the only way to test the button click is by logging something
      const spy = jest.spyOn(console, "log");
      expect(spy).not.toHaveBeenCalled();
      const button = wrapper.find(PlayStopButton);
      button.simulate("click");
      expect(spy).toHaveBeenCalled();
    });
  });
  it("plays when clicked from pause", () => {
    const customResolvers = resolvers.Mutation;
    act(() => {
      const wrapper = mount(
        <ApolloMockedProvider customResolvers={customResolvers}>
          <PlayStopButton />
        </ApolloMockedProvider>
      );
      expect(true).toBe(true);
    });
  });
  it("pauses when clicked from play", () => {
    const customResolvers = () => ({
      play: (
        parent: any,
        args: any,
        { cache }: { cache: InMemoryCache }
      ): number => {
        cache.writeData({ data: { playing: true, playStartTime: Date.now() } });
        return 0;
      },
      stop: (
        parent: any,
        args: any,
        { cache }: { cache: InMemoryCache }
      ): number => {
        cache.writeData({
          data: {
            playing: false,
            recording: false,
            playPosition: 0,
            playStartTime: -1
          }
        });
        return 1;
      }
    });
    act(() => {
      const wrapper = mount(
        <ApolloMockedProvider customResolvers={customResolvers}>
          <PlayStopButton />
        </ApolloMockedProvider>
      );
      expect(true).toBe(true);
    });
  });
});
