import * as React from "react";

import { RouteComponentProps } from "react-router";

import { HotKeysWrapper } from "../wrapper/hotkeys-wrapper";
import { SpeechControl } from "../wrapper/speech-control-wrapper";
import UserInVampProvider from "./user-in-vamp-provider";
import { useCurrentUserId } from "../../react-hooks";
import VampProvider from "./vamp-provider";
import ClipsProvider from "./clips-provider";
import WorkspaceContent from "./workspace-content";

interface MatchParams {
  vampid: string;
}

type ViewWorkspaceProps = RouteComponentProps<MatchParams>;

/**
 * The "workspace page." Everything below the header on the page for a Vamp,
 * essentially. In practice, this is where we're putting a lot of wrapper
 * components, and the layout should be done in the WorkspaceContent component.
 */
const ViewWorkspace: React.FunctionComponent<ViewWorkspaceProps> = (
  props: ViewWorkspaceProps
) => {
  const vampId = props.match.params.vampid;
  const userId = useCurrentUserId();

  return (
    <VampProvider vampId={vampId}>
      <ClipsProvider vampId={vampId}>
        <UserInVampProvider vampId={vampId} userId={userId}>
          <HotKeysWrapper>
            <SpeechControl>
              <WorkspaceContent />
            </SpeechControl>
          </HotKeysWrapper>
        </UserInVampProvider>
      </ClipsProvider>
    </VampProvider>
  );
};

export { ViewWorkspace };
