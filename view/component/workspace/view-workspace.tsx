import * as React from "react";

import { PlayPanel } from "./play-panel/play-panel";
import { useApolloClient, useQuery } from "react-apollo";
import { RouteComponentProps } from "react-router";

import styles = require("./view-workspace.less");
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { gql } from "apollo-boost";
import { useEffect } from "react";
import Timeline from "./timeline/timeline";
import { Clip } from "../../state/cache";

interface MatchParams {
  vampid: string;
}

type ViewWorkspaceProps = RouteComponentProps<MatchParams>;

const VAMP_QUERY = gql`
  query Vamp($id: ID!) {
    vamp(id: $id) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
    }
  }
`;

const CLIPS_QUERY = gql`
  query Clips($vampId: ID!) {
    clips(vampId: $vampId) {
      id
      audio {
        id
        filename
      }
    }
  }
`;

const VAMP_SUBSCRIPTION = gql`
  subscription vamp($vampId: ID!) {
    vamp(vampId: $vampId) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
    }
  }
`;

const CLIPS_SUBSCRIPTION = gql`
  subscription clips($vampId: ID!) {
    clips(vampId: $vampId) {
      mutation
      updatedClip {
        id
        audio {
          id
          filename
        }
      }
    }
  }
`;

const ViewWorkspace: React.FunctionComponent<ViewWorkspaceProps> = props => {
  const vampId = props.match.params.vampid;
  const {
    subscribeToMore: vampSubscribeToMore,
    data: vampData,
    error: vampError
  } = useQuery(VAMP_QUERY, {
    variables: { id: vampId }
  });

  const {
    subscribeToMore: clipsSubscribeToMore,
    data: clipsData,
    error: clipsError
  } = useQuery(CLIPS_QUERY, {
    variables: { vampId }
  });

  const client = useApolloClient();

  useEffect(() => {
    vampSubscribeToMore({
      document: VAMP_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newVamp = subscriptionData.data.vamp;
        console.log(newVamp);
        client.writeData({ data: newVamp });

        return {
          vamp: newVamp
        };
      }
    });
    clipsSubscribeToMore({
      document: CLIPS_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        console.log(subscriptionData);
        if (!subscriptionData.data) return prev;
        if (subscriptionData.data.clips.mutation === "ADDED") {
          console.log(prev);
          const newClips = [...prev.clips];
          newClips.push(subscriptionData.data.clips.updatedClip);
          return { clips: newClips };
        }
      }
    });
  }, []);

  if (vampError) {
    console.error(vampError);
  }
  if (clipsError) {
    console.error(clipsError);
  }

  if (!vampData || !clipsData) {
    return <div>Loading...</div>;
  }

  // TODO should definitely be rethought/put in a different file. Fills in clip
  // fields that we don't get from the clips query but need client-side.
  const localizeClips = (): Clip[] => {
    clipsData.clips.forEach((clip: Clip) => {
      clip.__typename == "Clip";
      clip.audio.__typename = "Audio";
      if (!clip.audio.storedLocally) clip.audio.storedLocally = false;
      if (!clip.audio.duration) clip.audio.duration = -1;
    });
    console.log(clipsData.clips);
    return clipsData.clips;
  };

  // If empty we render in the "new Vamp" layout.
  const empty = clipsData.clips.length == 0;

  client.writeData({ data: vampData.vamp });
  client.writeData({ data: { clips: localizeClips() } });

  if (vampData.vamp == null) {
    return <div>Vamp not found :(</div>;
  } else {
    return (
      <div className={styles["workspace"]}>
        <WorkspaceAudio></WorkspaceAudio>
        <div className={styles["play-and-tracks"]}>
          <div className={styles["play-panel"]}>
            <PlayPanel></PlayPanel>
          </div>
          <Timeline empty={empty}></Timeline>
        </div>
      </div>
    );
  }
};

export { ViewWorkspace };
