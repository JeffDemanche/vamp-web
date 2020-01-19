import * as React from "react";
import { Button } from "react-bootstrap";

import { Link } from "react-router-dom";

import classnames from "classnames";

const styles = require("./button.less");

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark"
  | "light"
  | "link"
  | "outline-primary"
  | "outline-secondary"
  | "outline-success"
  | "outline-danger"
  | "outline-warning"
  | "outline-info"
  | "outline-dark"
  | "outline-light";

const variantToClassname = (variant: ButtonVariant): string => {
  switch (variant) {
    case "primary":
      return "btn-primary";
    case "secondary":
      return "btn-secondary";
  }
};

const VampButton = ({
  style,
  variant,
  onClick,
  children
}: {
  style?: React.CSSProperties;
  variant?: ButtonVariant;
  onClick?: () => void;
  children?: string;
}): JSX.Element => {
  const classes = classnames(styles.btn, variantToClassname(variant));

  return (
    <Button
      variant={variant}
      className={classes}
      style={style}
      onClick={(): void => onClick && onClick()}
    >
      {children}
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
    <Link to={href} className={styles["btn"]} style={style}>
      {text}
    </Link>
  );
};

export { VampButton, ButtonLinkDefault };
