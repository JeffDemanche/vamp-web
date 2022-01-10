import * as React from "react";
import { render } from "enzyme";
import LoggedInUserButton from "../view/component/header/logged-in-user-button";
import { MockedProvider } from "@apollo/client/testing";

describe("Vamp Login Button Test", () => {
  it("should render user's name", () => {
    const me = {
      id: "123456",
      username: "Vamp User",
      email: "fakeemail123@gmail.com"
    };
    const wrapper = render(
      <MockedProvider>
        <LoggedInUserButton me={me} />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Vamp User");
  });
});
