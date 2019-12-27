import React from "react";

import styles from "./header.less";
import { VampLogo } from "./logo";

import { ButtonLinkDefault } from "../input/button";

const VampHeader = () => {
  return (
    <div className={styles["vamp-header"]}>
      <div className={styles["header-logo-panel"]}>
        <VampLogo></VampLogo>
      </div>
      <div className={styles["header-right-panel"]}>
        <ButtonLinkDefault
          text="Log In"
          style={{ marginTop: "auto", marginBottom: "auto" }}
          href="/login"
        ></ButtonLinkDefault>
      </div>
    </div>
  );
};

export { VampHeader };
