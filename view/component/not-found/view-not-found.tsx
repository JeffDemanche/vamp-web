import * as React from "react";

import * as styles from "./view-not-found.less";

export const ViewNotFound: React.FunctionComponent = () => (
  <div className={styles["notfound"]}>
    <h2>Sorry, we could not find this page</h2>
    <a href="/">Click to go Home</a>
  </div>
);
