import "jsdom-global/register";
import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { shallow, mount, render } from "enzyme";
import LoggedInUserButton from "../view/component/header/logged-in-user-button";
import { act } from "react-dom/test-utils";

describe("Vamp Login Button Test", () => {
  it("should render user's name", () => {
    const VampBot = {
      id: "123456",
      username: "Vamp User",
      email: "VampUser@gmail.com"
    };
    const customResolvers = {};
    act(() => {
      const wrapper = render(
        <ApolloMockedProvider customResolvers={customResolvers}>
          <LoggedInUserButton me={VampBot} />
        </ApolloMockedProvider>
      );
      expect(wrapper.text()).toContain("Vamp User");
    });
  });
});
