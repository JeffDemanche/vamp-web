import * as React from "react";
import * as styles from "./track.less";
import { DropZonesContext, DropZone } from "../workspace-content";
import { useRef, useEffect, useContext } from "react";

interface TrackProps {
  track: { id: string };
  index: number;
  children: React.ReactChild | React.ReactChild[];
}

const Track: React.FC<TrackProps> = ({
  track,
  index,
  children
}: TrackProps) => {
  const { registerDropZone } = useContext(DropZonesContext);
  const trackDropRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const dropZone: DropZone<{ index: number }> = {
      id: track.id,
      class: "Track" as const,
      ref: trackDropRef,
      metadata: { index }
    };
    registerDropZone(dropZone);

    return (): void => {};
  }, []);

  return (
    <div
      ref={trackDropRef}
      style={{ gridRowStart: `${index + 1}`, gridRowEnd: `${index + 1}` }}
      className={styles["track"]}
    >
      {children}
    </div>
  );
};

export default Track;
