import React from "react";

import styles from "./logo.less";

const VampLogo = () => {
  return (
    <div className={styles["vamp-logo"]}>
      <a href="/">
        <img src={require("../../img/vector/logo.svg")}></img>
      </a>
    </div>
  );
};

export { VampLogo };
