import * as React from "react";

import styles = require("./logo.less");

const VampLogo: React.FunctionComponent = () => {
  return (
    <div className={styles["vamp-logo"]}>
      <a href="/">
        <img src={require("../../img/vector/logo.svg")}></img>
      </a>
    </div>
  );
};

export { VampLogo };
