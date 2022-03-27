import * as React from "react";

import { HotKeysWrapper } from "../wrapper/hotkeys-wrapper";
import { SpeechControl } from "../../speech-recognition/speech-control-wrapper";
import UserInVampProvider from "./user-in-vamp-provider";
import { useCurrentUserId } from "../../util/react-hooks";
import VampProvider from "./vamp-provider";
import { WorkspaceContent } from "./workspace-content";
import { useParams } from "react-router";

/**
 * The "workspace page." Everything below the header on the page for a Vamp,
 * essentially. In practice, this is where we're putting a lot of wrapper
 * components, and the layout should be done in the WorkspaceContent component.
 */
const ViewWorkspace: React.FC<{}> = () => {
  const { vampid } = useParams();

  const userId = useCurrentUserId();

  return (
    <VampProvider vampId={vampid}>
      <UserInVampProvider vampId={vampid} userId={userId}>
        <HotKeysWrapper>
          <SpeechControl>
            <WorkspaceContent />
          </SpeechControl>
        </HotKeysWrapper>
      </UserInVampProvider>
    </VampProvider>
  );
};

export { ViewWorkspace };
