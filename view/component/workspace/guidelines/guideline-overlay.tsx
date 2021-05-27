import * as React from "react";
import { useContext } from "react";
import { useWorkspaceLeft } from "../../../util/workspace-hooks";
import { GuidelineContext } from "../context/guideline-context";
import * as styles from "./guideline-overlay.less";

export const GuidelineOverlay: React.FC<{}> = () => {
  const { start, end, isShowing } = useContext(GuidelineContext);

  const leftFn = useWorkspaceLeft();
  const left = leftFn(start);
  const width = leftFn(end) - left;

  return (
    <div className={styles["overlay-wrapper"]}>
      {isShowing && (
        <div className={styles["overlay"]} style={{ left, width }}></div>
      )}
    </div>
  );
};
