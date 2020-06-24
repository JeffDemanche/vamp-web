import * as React from "react";

import * as styles from "./timeline.less";
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Cab } from "../cab/cab";
import TimelineClips from "./timeline-clips";
import { GET_CLIPS } from "../../../state/queries";

const TIMELINE_QUERY = gql`
  query Timeline {
    clips @client {
      id @client
      start @client
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
const Timeline: React.FunctionComponent<{}> = () => {
  // Queries the cache to update state based on whether the client is recording.
  const { data: recordingData } = useQuery(RECORDING);

  const { data, loading, error } = useQuery(TIMELINE_QUERY);

  const { data: clipsData } = useQuery(gql`
    query GetClips {
      clips @client {
        id @client
        start @client
        audio @client {
          id @client
          filename @client
          tempFilename @client
        }
      }
    }
  `);

  // If empty we render in the "new Vamp" layout.
  const empty = clipsData ? clipsData.clips.length == 0 : true;

  if (!data || loading) {
    return <div>Loading</div>;
  }

  if (empty) {
    return (
      <div className={styles["timeline"]}>
        <Cab empty={empty} recording={recordingData.recording}></Cab>
      </div>
    );
  } else {
    return (
      <div className={styles["timeline"]}>
        <TimelineClips clips={data.clips}></TimelineClips>
        <Cab empty={empty} recording={recordingData.recording}></Cab>
      </div>
    );
  }
};

export default Timeline;
