import * as React from "react";

import { Link } from "react-router-dom";

import classnames from "classnames";

import * as styles from "./button.less";

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
  buttonRef,
  children
}: {
  style?: React.CSSProperties;
  variant?: ButtonVariant;
  onClick?: React.MouseEventHandler;
  buttonRef?: React.MutableRefObject<HTMLButtonElement>;
  children?: React.ReactChildren | React.ReactChild;
}): JSX.Element => {
  const classes = classnames(styles["btn"], variantToClassname(variant));

  return (
    <button className={classes} style={style} ref={buttonRef} onClick={onClick}>
      {children}
    </button>
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
