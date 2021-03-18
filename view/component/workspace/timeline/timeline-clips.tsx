import * as React from "react";

import styles = require("./timeline.less");
import Clip from "../clip/clip";
import Track from "./track";
import { useContext, useEffect, useMemo, useState } from "react";
import { DropZone, DropZonesContext } from "../workspace-drop-zones";

interface TimelineClipsProps {
  tracks: { id: string }[];
  clips: {
    id: string;
    start: number;
    duration: number;
    track: {
      id: string;
    };
    content: {
      start: number;
      duration: number;
      type: string;
      audio: {
        id: string;
        filename: string;
        storedLocally: boolean;
        localFilename: string;
        latencyCompensation: number;
        duration: number;
        error: string | null;
      };
    }[];
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
  const { setTrackDropZones } = useContext(DropZonesContext);
  const [tracksMarkup, setTracksMarkup] = useState<JSX.Element[]>([]);

  // This listens to changes to the tracks data and then 1. updates the markup
  // and 2. handles registering the dropzones that get used for dragging clips
  // around the workspace.
  //
  // NOTE: this component doesn't get rendered when the timeline is empty, so as
  // of this commit there could be an unused drop zone on the empty state until
  // this component gets rerendered.
  useEffect(() => {
    const markup: JSX.Element[] = [];

    const dzs: DropZone<{ index: number }>[] = [];

    if (tracks) {
      tracks.forEach((track, trackIndex) => {
        const ref = React.createRef<HTMLDivElement>();
        dzs.push({
          class: "Track",
          id: track.id,
          ref,
          metadata: { index: trackIndex }
        });

        markup.push(
          <Track
            index={trackIndex}
            key={track.id}
            track={track}
            refForDropZone={ref}
          >
            <div></div>
          </Track>
        );
      });
    }

    setTracksMarkup(markup);
    setTrackDropZones(dzs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  const clipsMarkup = useMemo(
    () =>
      clips.map((clip, clipIndex) => {
        const trackIndex = tracks.findIndex(
          track => track.id === clip.track.id
        );
        return (
          <Clip
            index={clipIndex}
            trackIndex={trackIndex}
            key={clip.id}
            clip={clip}
          ></Clip>
        );
      }),
    [clips, tracks]
  );

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
