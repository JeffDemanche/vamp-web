import * as React from "react";
import { render } from "enzyme";
import LoggedInUserButton from "../view/component/header/logged-in-user-button";

// TODO Shitty workaround from here:
// https://github.com/apollographql/apollo-client/issues/5306
import { MockedProvider as MockedProviderBroken } from "@apollo/client/testing";
import {
  MockedProviderProps,
  MockedProviderState
} from "@apollo/client/utilities/testing/mocking/MockedProvider";

const MockedProvider = MockedProviderBroken as React.ComponentClass<
  MockedProviderProps,
  MockedProviderState
>;

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
