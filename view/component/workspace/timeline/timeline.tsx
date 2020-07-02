import * as React from "react";

import * as styles from "./timeline.less";
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Cab } from "../cab/cab";
import TimelineClips from "./timeline-clips";
import { GET_CLIPS_CLIENT } from "../../../queries/clips-queries";
import { RECORDING_CLIENT } from "../../../queries/vamp-queries";
import {
  RecordingClient,
  GetClipsClient,
  TimelineClient
} from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";

const TIMELINE_CLIENT = gql`
  query TimelineClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      clips @client {
        id @client
        start @client
        audio @client {
          id @client
          filename @client
          localFilename @client
          storedLocally @client
          duration @client
        }
      }
    }
  }
`;

/**
 * Timeline is everything below the play panel.
 */
const Timeline: React.FunctionComponent<{}> = () => {
  const vampId = useCurrentVampId();

  // Queries the cache to update state based on whether the client is recording.
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });

  const { data, loading, error } = useQuery<TimelineClient>(TIMELINE_CLIENT, {
    variables: { vampId }
  });

  const { data: clipsData } = useQuery<GetClipsClient>(GET_CLIPS_CLIENT, {
    variables: { vampId }
  });

  // If empty we render in the "new Vamp" layout.
  const empty = clipsData ? clipsData.vamp.clips.length == 0 : true;

  if (!data || loading) {
    return <div>Loading</div>;
  }

  if (empty) {
    return (
      <div className={styles["timeline"]}>
        <Cab empty={empty} recording={recordingData.vamp.recording}></Cab>
      </div>
    );
  } else {
    return (
      <div className={styles["timeline"]}>
        <TimelineClips clips={data.vamp.clips}></TimelineClips>
        <Cab empty={empty} recording={recordingData.vamp.recording}></Cab>
      </div>
    );
  }
};

export default Timeline;
