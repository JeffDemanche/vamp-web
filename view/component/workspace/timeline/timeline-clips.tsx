import * as React from "react";

import styles = require("./timeline.less");
import Clip from "../clip/clip";
import Track from "./track";
import { useContext, useEffect, useMemo } from "react";
import { DropZone, DropZonesContext } from "../workspace-drop-zones";
import { usePrevious } from "../../../util/react-hooks";

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
  const { removeDropZone, dropZones } = useContext(DropZonesContext);
  const prevTracks = usePrevious(tracks);

  useEffect(() => {
    const trackIds = new Set(tracks.map(t => t.id));
    if (prevTracks) {
      prevTracks.forEach(prevTrack => {
        if (!trackIds.has(prevTrack.id)) {
          removeDropZone(prevTrack.id);
        }
      });
    }
  }, [tracks, prevTracks, removeDropZone]);

  const tracksMarkup = useMemo(() => {
    return tracks.map((track, trackIndex) => {
      return (
        <Track index={trackIndex} key={trackIndex} track={track}>
          <div></div>
        </Track>
      );
    });
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
