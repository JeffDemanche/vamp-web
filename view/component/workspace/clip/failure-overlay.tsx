import * as React from "react";
import * as styles from "./failure-overlay.less";

interface FailureOverlayProps {
  error: string;
  height: number;
}

export const FailureOverlay: React.FC<FailureOverlayProps> = ({
  error,
  height
}: FailureOverlayProps) => {
  return (
    <div className={styles["failure-overlay"]}>
      <div className={styles["vertical-justify"]}>
        <i className={`ri-emotion-sad-line ri-3x`}></i>
        <span>{error}</span>
      </div>
    </div>
  );
};
