import { mount, render } from "enzyme";
// eslint-disable-next-line max-len
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { resolvers } from "../view/state/resolvers";
import { act } from "react-dom/test-utils";
import { PlayPanel } from "../view/component/workspace/play-panel/play-panel";

describe("Play Panel functionality", () => {
  it("should work", async () => {
    const customResolvers = {};
    await act(async () => {
      const wrapper = await render(
        <ApolloMockedProvider customResolvers={customResolvers}>
          <PlayPanel />
        </ApolloMockedProvider>
      );
      console.log(wrapper.html());
    });
  });
});
