import * as React from "react";
import { Popover } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import { Placement } from "react-bootstrap/Overlay";

import * as styles from "./popover.less";

interface VampPopoverProps {
  id: string;
  placement: Placement;
  content?: JSX.Element;
  title?: string;
  children?: JSX.Element;
}

const VampPopover = (props: VampPopoverProps): JSX.Element => {
  const title = props.title && (
    <Popover.Title
      as="h3"
      className={styles["popover-title"]}
    >{`User Settings`}</Popover.Title>
  );

  const popover = (
    // TODO: fix this typescript error with styled popover, still renders ok
    <Popover id={props.id} className={styles["popover"]}>
      {title}
      <Popover.Content className={styles["popover-content"]}>
        {props.content}
      </Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement={props.placement}
      rootClose
      overlay={popover}
    >
      {props.children}
    </OverlayTrigger>
  );
};

export { VampPopover };
