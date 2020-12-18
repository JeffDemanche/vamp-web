import * as React from "react";

import "bootstrap/dist/css/bootstrap.css";

import { VampToggleButton } from "../toggle-button";

export default { title: "Fancy Toggle Button" };

export const togglable = () => <VampToggleButton>Toggle</VampToggleButton>;

togglable.story = {
  name: "Togglable"
};
