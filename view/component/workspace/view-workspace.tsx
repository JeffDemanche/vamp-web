import * as React from "react";

import { PlayPanel } from "./play-panel/play-panel";
import { useApolloClient, useQuery } from "react-apollo";
import { RouteComponentProps } from "react-router";

import * as styles from "./view-workspace.less";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { gql } from "apollo-boost";
import { useEffect } from "react";
import Timeline from "./timeline/timeline";
import { Clip } from "../../state/cache";
import VampSubscriptionProvider from "./vamp-subscription-provider";
import ClipsSubscriptionProvider from "./clips-subscription-provider";
import { GET_CLIPS } from "../../state/queries";

import { HotKeysWrapper } from "../wrapper/hotkeys-wrapper";
import { GlobalHotKeys } from "react-hotkeys";

interface MatchParams {
  vampid: string;
}

type ViewWorkspaceProps = RouteComponentProps<MatchParams>;

const ViewWorkspace: React.FunctionComponent<ViewWorkspaceProps> = (
  props: ViewWorkspaceProps
) => {
  const vampId = props.match.params.vampid;

  return (
    <VampSubscriptionProvider vampId={vampId}>
      <ClipsSubscriptionProvider vampId={vampId}>
        <HotKeysWrapper>
          <div className={styles["workspace"]}>
            <WorkspaceAudio></WorkspaceAudio>
            <div className={styles["play-and-tracks"]}>
              <div className={styles["play-panel"]}>
                <PlayPanel></PlayPanel>
              </div>
              <Timeline></Timeline>
            </div>
          </div>
        </HotKeysWrapper>
      </ClipsSubscriptionProvider>
    </VampSubscriptionProvider>
  );
};

export { ViewWorkspace };
