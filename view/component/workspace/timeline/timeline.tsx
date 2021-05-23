import * as React from "react";
import { gql, useQuery } from "@apollo/client";
import * as styles from "./timeline.less";
import { Cab } from "../cab/cab";
import TimelineClips from "./timeline-clips";
import { RECORDING_CLIENT } from "../../../state/queries/vamp-queries";
import { RecordingClient, TimelineClient } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";
import { MutableRefObject } from "react";
import { Metronome } from "./metronome/metronome";
import { useIsEmpty } from "../hooks/use-is-empty";

const TIMELINE_CLIENT = gql`
  query TimelineClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      tracks {
        id
      }
      clips {
        id
        start
        duration
        track {
          id
        }
        content {
          start
          duration
          type
          audio {
            id
            filename
            localFilename
            storedLocally
            latencyCompensation
            duration
            error
          }
        }
        draggingInfo {
          dragging
          track
          position
        }
      }
    }
  }
`;

interface TimelineProps {
  offsetRef: MutableRefObject<HTMLDivElement>;
  // See workspace-content.tsx for how this works.
  tracksRef: (node: HTMLDivElement) => void;
}

/**
 * Timeline is everything below the play panel.
 */
const Timeline: React.FunctionComponent<TimelineProps> = ({
  offsetRef,
  tracksRef
}: TimelineProps) => {
  const vampId = useCurrentVampId();

  // Queries the cache to update state based on whether the client is recording.
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });

  const { data, loading, error } = useQuery<TimelineClient>(TIMELINE_CLIENT, {
    variables: { vampId }
  });

  // If empty we render in the "new Vamp" layout.
  const empty = useIsEmpty();

  if (!data || loading) {
    return <div>Loading</div>;
  }

  const timelineContent = empty ? (
    <Cab empty={empty} recording={recordingData.vamp.recording}></Cab>
  ) : (
    <>
      <div className={styles["top-cell"]}>
        <Metronome></Metronome>
      </div>
      <div className={styles["middle-cell"]}>
        <TimelineClips
          tracks={data.vamp.tracks}
          clips={data.vamp.clips}
          tracksRef={tracksRef}
        ></TimelineClips>
      </div>
      <div className={styles["bottom-cell"]}>
        <Cab empty={empty} recording={recordingData.vamp.recording}></Cab>
      </div>
    </>
  );

  return <div className={styles["timeline"]}>{timelineContent}</div>;
};

export default Timeline;
