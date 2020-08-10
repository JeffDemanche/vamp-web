import * as React from "react";

import styles = require("./timeline.less");
import Clip from "../clip/clip";
import VerticalSpacer from "../../element/vertical-spacer";

interface TimelineClipsProps {
  clips: {
    id: string;
    start: number;
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
  // Insert vertical spacers between clips but not after the last one.
  const clipsMarkup = clips.map((clip, index) =>
    index === clips.length - 1 ? (
      <Clip key={index} clip={clip}></Clip>
    ) : (
      <React.Fragment key={index}>
        <Clip key={index} clip={clip}></Clip>
        <VerticalSpacer height={10} />
      </React.Fragment>
    )
  );
  return <div className={styles["timeline-clips"]}>{clipsMarkup}</div>;
};

export default TimelineClips;
