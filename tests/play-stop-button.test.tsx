import { mount } from "enzyme";
// eslint-disable-next-line max-len
import { PlayStopButton } from "../view/component/workspace/play-panel/play-stop-button";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { resolvers } from "../view/state/schema";
import { act } from "react-dom/test-utils";

describe("Play/Stop Button functionality", () => {
  // beforeEach(() => {});
  it("handles clicking", async () => {
    const customResolvers = {};

    await act(async () => {
      const spy = jest.spyOn(console, "log");
      expect(spy).not.toHaveBeenCalled();
      const wrapper = mount(
        <ApolloMockedProvider customResolvers={customResolvers}>
          <PlayStopButton />
        </ApolloMockedProvider>
      );
      //TODO: currently the only way to test the button click is by logging something
      const button = await wrapper.find(PlayStopButton);
      button.simulate("click");
      expect(spy).toHaveBeenCalled();
    });
  });
});
