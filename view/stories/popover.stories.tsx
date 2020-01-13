import * as React from "react";

import "bootstrap/dist/css/bootstrap.css";

import { VampButton } from "../component/element/button";
import { VampPopover } from "../component/element/popover";

export default { title: "Vamp Popover" };

export const popoverOnClick = () => (
  <VampPopover
    id="0"
    placement="bottom"
    title="Popover Title"
    content={<div>Popover content (a DOM Element).</div>}
  >
    <VampButton>Click to Popover</VampButton>
  </VampPopover>
);

popoverOnClick.story = {
  name: "Button Popover"
};
