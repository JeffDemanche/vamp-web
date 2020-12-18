import * as React from "react";

import styles = require("./timeline.less");
import Clip from "../clip/clip";
import Track from "./track";

interface TimelineClipsProps {
  tracks: { id: string }[];
  clips: {
    id: string;
    start: number;
    duration: number;
    track: {
      id: string;
    };
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
      error: string | null;
    };
    draggingInfo: {
      dragging?: boolean;
      track?: string;
      position?: number;
    };
  }[];
  tracksRef: (node: HTMLDivElement) => void;
}

const TimelineClips: React.FunctionComponent<TimelineClipsProps> = ({
  tracks,
  clips,
  tracksRef
}: TimelineClipsProps) => {
  console.log(tracks);
  console.log(clips);

  const tracksMarkup = tracks.map((track, trackIndex) => {
    return (
      <Track index={trackIndex} key={trackIndex} track={track}>
        <div></div>
      </Track>
    );
  });

  const clipsMarkup = clips.map((clip, clipIndex) => {
    const trackIndex = tracks.findIndex(track => track.id === clip.track.id);
    return (
      <Clip
        index={clipIndex}
        trackIndex={trackIndex}
        key={clip.id}
        clip={clip}
      ></Clip>
    );
  });

  return (
    <div className={styles["timeline-clips"]} ref={tracksRef}>
      <>
        {clipsMarkup}
        {tracksMarkup}
      </>
    </div>
  );
};

export default TimelineClips;
