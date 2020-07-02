import * as React from "react";

import styles = require("./timeline.less");
import Clip from "../clip/clip";

interface TimelineClipsProps {
  clips: {
    id: string;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
    };
  }[];
}

const TimelineClips: React.FunctionComponent<TimelineClipsProps> = ({
  clips
}: TimelineClipsProps) => {
  const clipsMarkup = clips.map((clip, index) => (
    <Clip key={index} clip={clip}></Clip>
  ));
  return <div className={styles["timeline-clips"]}>{clipsMarkup}</div>;
};

export default TimelineClips;
