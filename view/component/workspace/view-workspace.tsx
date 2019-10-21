import * as React from "react";

import { Clip } from "./clip";
import { PlayPanel } from "./play-panel/play-panel";

const styles = require("./view-workspace.less");

const ViewWorkspace = () => {
  return (
    <div className={styles["workspace"]}>
      <div className={styles["play-and-tracks"]}>
        <div className={styles["play-panel"]}>
          <PlayPanel></PlayPanel>
        </div>
        <div className={styles["clips-panel"]}>
          <Clip></Clip>
        </div>
      </div>
    </div>
  );
};

export { ViewWorkspace };
