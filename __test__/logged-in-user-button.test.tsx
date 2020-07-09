import * as React from "react";
import { ApolloMockedProvider } from "./test-utils/providers";
import { render } from "enzyme";
import LoggedInUserButton from "../view/component/header/logged-in-user-button";
import { act } from "react-dom/test-utils";

describe("Vamp Login Button Test", () => {
  it("should render user's name", () => {
    const me = {
      id: "123456",
      username: "Vamp User",
      email: "fakeemail123@gmail.com"
    };
    const wrapper = render(
      <ApolloMockedProvider>
        <LoggedInUserButton me={me} />
      </ApolloMockedProvider>
    );
    expect(wrapper.text()).toContain("Vamp User");
  });
});
