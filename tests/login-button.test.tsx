import * as React from "react";
import {
  ApolloErrorProvider,
  ApolloLoadingProvider,
  ApolloMockedProvider
} from "./test-utils/providers";
import { shallow, mount, render } from "enzyme";
import LoggedInUserButton from "../view/component/header/logged-in-user-button";

const customResolvers = {
  Query: () => ({
    me: [{ username: "VampBot" }]
  })
};

describe("Vamp Login Button Test", () => {
  it("should work", () => {
    const wrapper = render(
      <ApolloMockedProvider customResolvers={customResolvers}>
        <h1>hello world</h1>
      </ApolloMockedProvider>
    );
  });
});
