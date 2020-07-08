import * as React from "react";
import { Popover } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import { Placement } from "react-bootstrap/Overlay";
import styled, { StyledComponent } from "styled-components";

import * as styles from "./popover.less";

const StyledPopover: StyledComponent<Popover, any, {}, never> = styled(Popover)`
  & > .arrow {
    border-color: black;
  }
  & > .arrow::before {
    border-style: ridge;
  }
  & > .arrow::after {
    border-style: ridge;
    border: 1px;
  }
`;

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
