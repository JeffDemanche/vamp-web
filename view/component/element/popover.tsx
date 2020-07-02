import * as React from "react";
import { Popover } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import { Placement } from "react-bootstrap/Overlay";
import styled from "styled-components";

import * as styles from "./popover.less";
import { useEffect } from "react";

const StyledPopover = styled(Popover)`
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
    <StyledPopover id={props.id} className={styles["popover"]}>
      {title}
      <Popover.Content className={styles["popover-content"]}>
        {props.content}
      </Popover.Content>
    </StyledPopover>
  );

  // useEffect(() => {
  //   document.addEventListener("click", () => {
  //     console.log("fizz!");
  //   });
  //   document.removeEventListener("click", () => {
  //     console.log("buzz!");
  //   });
  // });
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
