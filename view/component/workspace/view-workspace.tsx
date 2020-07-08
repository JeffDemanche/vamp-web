import * as React from "react";

import { PlayPanel } from "./play-panel/play-panel";
import { RouteComponentProps } from "react-router";

import * as styles from "./view-workspace.less";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import Timeline from "./timeline/timeline";
import VampSubscriptionProvider from "./vamp-subscription-provider";
import ClipsSubscriptionProvider from "./clips-subscription-provider";

import { HotKeysWrapper } from "../wrapper/hotkeys-wrapper";
import { SpeechRecognizer } from "../wrapper/speech-recognition-wrapper";

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
          <SpeechRecognizer>
            <div className={styles["workspace"]}>
              <WorkspaceAudio vampId={vampId}></WorkspaceAudio>
              <div className={styles["play-and-tracks"]}>
                <div className={styles["play-panel"]}>
                  <PlayPanel></PlayPanel>
                </div>
                <Timeline></Timeline>
              </div>
            </div>
          </SpeechRecognizer>
        </HotKeysWrapper>
      </ClipsSubscriptionProvider>
    </VampSubscriptionProvider>
  );
};

export { ViewWorkspace };
