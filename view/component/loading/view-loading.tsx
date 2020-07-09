import * as React from "react";
import { Spinner } from "react-bootstrap";

import * as styles from "./view-loading.less";

export const ViewLoading: React.FunctionComponent = () => {
  return (
    <div className={styles["loading"]}>
      <Spinner animation="border" role="status" variant="secondary" size="sm">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
};
