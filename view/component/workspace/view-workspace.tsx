import * as React from "react";

import { Playhead } from "./playhead/playhead";
import { PlayPanel } from "./play-panel/play-panel";
import { useApolloClient, useQuery } from "react-apollo";
import { RouteComponentProps } from "react-router";

import styles = require("./view-workspace.less");
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { gql } from "apollo-boost";
import { useEffect } from "react";

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
      # creator
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

const ViewWorkspace: React.FunctionComponent<ViewWorkspaceProps> = props => {
  const vampId = props.match.params.vampid;
  const { subscribeToMore, data, error } = useQuery(VAMP_QUERY, {
    variables: { id: vampId }
  });
  const client = useApolloClient();

  useEffect(() => {
    subscribeToMore({
      document: VAMP_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newVamp = subscriptionData.data.vamp;
        client.writeData({ data: newVamp });

        return {
          vamp: newVamp
        };
      }
    });
  }, []);

  if (error) {
    console.error(error);
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  client.writeData({ data: data.vamp });

  if (data.vamp == null) {
    return <div>Vamp not found :(</div>;
  } else {
    return (
      <div className={styles["workspace"]}>
        <WorkspaceAudio></WorkspaceAudio>
        <div className={styles["play-and-tracks"]}>
          <div className={styles["play-panel"]}>
            <PlayPanel></PlayPanel>
          </div>
          <div className={styles["clips-panel"]}>
            <Playhead initialState="new"></Playhead>
          </div>
        </div>
      </div>
    );
  }
};

export { ViewWorkspace };
