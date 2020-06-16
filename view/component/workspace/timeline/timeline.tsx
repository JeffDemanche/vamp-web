import * as React from "react";

import styles = require("./timeline.less");
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Playhead } from "../playhead/playhead";
import TimelineClips from "./timeline-clips";

interface TimelineProps {
  empty: boolean;
}

const TIMELINE_QUERY = gql`
  query Timeline {
    clips @client {
      id @client
      audio @client {
        id @client
        filename @client
        storedLocally @client
        duration @client
      }
    }
  }
`;

const RECORDING = gql`
  query Recording {
    recording @client
  }
`;

/**
 * Timeline is everything below the play panel.
 */
const Timeline: React.FunctionComponent<TimelineProps> = ({
  empty
}: TimelineProps) => {
  // Queries the cache to update state based on whether the client is recording.
  const { data: recordingData } = useQuery(RECORDING);

  const { data, loading, error } = useQuery(TIMELINE_QUERY);

  if (!data || loading) {
    return <div>Loading</div>;
  }

  if (empty) {
    return (
      <div className={styles["timeline"]}>
        <Playhead empty={empty} recording={recordingData.recording}></Playhead>
      </div>
    );
  } else {
    return (
      <div className={styles["timeline"]}>
        <TimelineClips clips={data.clips}></TimelineClips>
        <Playhead empty={empty} recording={recordingData.recording}></Playhead>
      </div>
    );
  }
};

export default Timeline;
