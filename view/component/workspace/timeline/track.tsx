import * as React from "react";
import * as styles from "./track.less";

interface TrackProps {
  children: React.ReactChild | React.ReactChild[];
}

const Track: React.FC<TrackProps> = ({ children }: TrackProps) => {
  return <div className={styles["track"]}>{children}</div>;
};

export default Track;
