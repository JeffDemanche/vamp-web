import * as React from "react";
import * as styles from "./track.less";

interface TrackProps {
  track: { id: string };
  index: number;
  refForDropZone: React.MutableRefObject<HTMLDivElement>;
  children: React.ReactChild | React.ReactChild[];
}

const Track: React.FC<TrackProps> = ({
  track,
  index,
  refForDropZone,
  children
}: TrackProps) => {
  return (
    <div
      ref={refForDropZone}
      style={{ gridRowStart: `${index + 1}`, gridRowEnd: `${index + 1}` }}
      className={styles["track"]}
    >
      {children}
    </div>
  );
};

export default Track;
