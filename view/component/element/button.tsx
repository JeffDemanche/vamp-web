import * as React from "react";
import { Button } from "react-bootstrap";

import { Link } from "react-router-dom";

const styles = require("./button.less");

const VampButton = ({
  text,
  style,
  onClick
}: {
  text: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}): JSX.Element => {
  return (
    <Button variant="primary" style={style} onClick={(): void => onClick()}>
      {text}
    </Button>
  );
};

const ButtonLinkDefault = ({
  text,
  href,
  style
}: {
  text: string;
  href: string;
  style?: React.CSSProperties;
}): JSX.Element => {
  return (
    <Link to={href} className={styles["button-default"]} style={style}>
      {text}
    </Link>
  );
};

export { VampButton, ButtonLinkDefault };
