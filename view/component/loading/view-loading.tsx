import * as React from "react";
import { Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { ViewNotFound } from "../not-found/view-not-found";

import * as styles from "./view-loading.less";

export const ViewLoading: React.FunctionComponent = () => {
  // If loading too long, render the not found page
  return (
    <div className={styles["loading"]}>
      <Spinner animation="border" role="status" variant="secondary" size="sm">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
};
