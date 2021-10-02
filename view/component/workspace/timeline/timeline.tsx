import * as React from "react";
import { gql, useQuery } from "@apollo/client";
import * as styles from "./timeline.less";
import { Cab } from "../cab/cab";
import TimelineClips from "./timeline-clips";
import { TimelineClient } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";
import { useContext } from "react";
import { Metronome } from "./metronome/metronome";
import { useIsEmpty } from "../hooks/use-is-empty";
import { GuidelineOverlay } from "../guidelines/guideline-overlay";
import { PlaybackContext } from "../context/recording/playback-context";

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
      }
    }
  }
`;

interface TimelineProps {
  // See workspace-content.tsx for how this works.
  tracksRef: (node: HTMLDivElement) => void;
}

/**
 * Timeline is everything below the play panel.
 */
const Timeline: React.FunctionComponent<TimelineProps> = ({
  tracksRef
}: TimelineProps) => {
  const vampId = useCurrentVampId();

  const { recording } = useContext(PlaybackContext);

  const { data, loading } = useQuery<TimelineClient>(TIMELINE_CLIENT, {
    variables: { vampId }
  });

  // If empty we render in the "new Vamp" layout.
  const empty = useIsEmpty();

  if (!data || loading) {
    return <div>Loading</div>;
  }

  const timelineContent = empty ? (
    <Cab empty={empty} recording={recording}></Cab>
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
        <Cab empty={empty} recording={recording}></Cab>
      </div>
    </>
  );

  return (
    <div className={styles["timeline-and-guidelines"]}>
      <GuidelineOverlay></GuidelineOverlay>
      <div className={styles["timeline"]}>{timelineContent}</div>
    </div>
  );
};

export default Timeline;
