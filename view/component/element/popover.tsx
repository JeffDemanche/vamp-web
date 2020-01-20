import * as React from "react";
import { Popover } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import { Placement } from "react-bootstrap/Overlay";

import styles = require("./popover.less");

interface VampPopoverProps {
  id: string;
  placement: Placement;
  content?: JSX.Element;
  title?: string;
  children?: JSX.Element;
}

const VampPopover = (props: VampPopoverProps): JSX.Element => {
  const title = props.title && (
    <Popover.Title as="h3">{`User Settings`}</Popover.Title>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement={props.placement}
      rootClose
      overlay={
        <Popover id={props.id} className={styles["popover"]}>
          {title}
          <Popover.Content>{props.content}</Popover.Content>
        </Popover>
      }
    >
      {props.children}
    </OverlayTrigger>
  );
};

export { VampPopover };
