import * as React from "react";

import * as styles from "./timeline.less";
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Cab } from "../cab/cab";
import TimelineClips from "./timeline-clips";
import { GET_CLIPS_CLIENT } from "../../../state/queries/clips-queries";
import { RECORDING_CLIENT } from "../../../state/queries/vamp-queries";
import {
  RecordingClient,
  GetClipsClient,
  TimelineClient
} from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";
import MetronomeBar from "./metronome/metronome-bar";
import VerticalSpacer from "../../element/vertical-spacer";
import { MutableRefObject } from "react";

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
const Timeline: React.FunctionComponent<{
  offsetRef: MutableRefObject<HTMLDivElement>;
}> = ({ offsetRef }: { offsetRef: MutableRefObject<HTMLDivElement> }) => {
  const vampId = useCurrentVampId();

  // Queries the cache to update state based on whether the client is recording.
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });

  const { data, loading } = useQuery<TimelineClient>(TIMELINE_CLIENT, {
    variables: { vampId }
  });

  const { data: clipsData } = useQuery<GetClipsClient>(GET_CLIPS_CLIENT, {
    variables: { vampId }
  });

  // If empty we render in the "new Vamp" layout.
  const empty = clipsData ? clipsData.vamp.clips.length == 0 : true;

  // const { data: viewStateData, loading: viewStateLoading } = useQuery<
  //   ViewStateClient
  // >(VIEW_STATE_CLIENT, { variables: { vampId } });

  if (!data || loading) {
    return <div>Loading</div>;
  }

  const timelineContent = empty ? (
    <Cab empty={empty} recording={recordingData.vamp.recording}></Cab>
  ) : (
    <>
      <MetronomeBar></MetronomeBar>
      <VerticalSpacer height={20}></VerticalSpacer>
      <TimelineClips clips={data.vamp.clips}></TimelineClips>
      <Cab empty={empty} recording={recordingData.vamp.recording}></Cab>
    </>
  );

  return (
    <div className={styles["timeline"]}>
      <div className={styles["position-offset"]} ref={offsetRef}>
        {timelineContent}
      </div>
    </div>
  );
};

export default Timeline;
