import React from "react";

import styles from "./logo.less";

const VampLogo = () => {
  return (
    <div className={styles["vamp-logo"]}>
      <img src={require("../../img/vector/logo.svg")}></img>
    </div>
  );
};

export { VampLogo };
