import * as React from "react";

import "bootstrap/dist/css/bootstrap.css";

import { VampButton } from "../component/element/button";

export default { title: "Vamp Button" };

export const primaryWithText = () => (
  <VampButton variant="primary">A primary button</VampButton>
);

primaryWithText.story = {
  name: "Primary Button"
};

export const secondaryWithText = () => (
  <VampButton variant="secondary">A secondary button</VampButton>
);

secondaryWithText.story = {
  name: "Secondary Button"
};
