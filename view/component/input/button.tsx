import * as React from "react";
import { useState, useEffect, useRef } from "react";

const { Link } = require("react-router-dom");

const styles = require("./button.less");

const ButtonDefault = ({
  text,
  style,
  onClick
}: {
  text: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) => {
  return (
    <button
      className={styles["default-button"]}
      style={style}
      onClick={e => onClick()}
    >
      {text}
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
}) => {
  return (
    <Link to={href} className={styles["default-button"]} style={style}>
      {text}
    </Link>
  );
};

export { ButtonDefault, ButtonLinkDefault };
