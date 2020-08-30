import * as React from "react";

import styles = require("./timeline.less");
import Clip from "../clip/clip";
import VerticalSpacer from "../../element/vertical-spacer";
import Track from "./track";
import { MutableRefObject } from "react";

interface TimelineClipsProps {
  tracks: { id: string }[];
  clips: {
    id: string;
    start: number;
    track: {
      id: string;
    };
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
    };
  }[];
  tracksRef: (node: HTMLDivElement) => void;
}

const TimelineClips: React.FunctionComponent<TimelineClipsProps> = ({
  tracks,
  clips,
  tracksRef
}: TimelineClipsProps) => {
  const tracksMarkup = tracks.map((track, trackIndex) => {
    const trackClips = clips
      .filter(clip => clip.track.id === track.id)
      .map((clip, clipIndex) => {
        return <Clip key={clipIndex} clip={clip}></Clip>;
      });
    return <Track key={trackIndex}>{trackClips}</Track>;
  });

  return (
    <div className={styles["timeline-clips"]} ref={tracksRef}>
      {tracksMarkup}
    </div>
  );
};

export default TimelineClips;
