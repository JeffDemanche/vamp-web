import * as React from "react";
import * as styles from "./workspace-content.less";
import { useCurrentVampId } from "../../util/react-hooks";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { PlayPanel } from "./play-panel/play-panel";
import Timeline from "./timeline/timeline";
import { DropZonesProvider } from "./workspace-drop-zones";
import { FloorOverlay } from "./floor/floor-overlay";
import { MetronomeProvider } from "./context/metronome-context";
import { GuidelineProvider } from "./context/guideline-context";
import { DraggableProvider } from "./context/draggable-context";
import { PlaybackProvider } from "./context/recording/playback-context";
import { RecordingProvider } from "./context/recording/recording-context";
import { WorkspaceScrollProvider } from "./context/workspace-scroll-context";
import { SelectionProvider } from "./context/selection-context";

/**
 * Contains the content of the ViewWorkspace component (that component is
 * focused on providers and wrappers).
 *
 * Also handles worspace scrolling operations.
 */
const WorkspaceContent: React.FC = () => {
  const vampId = useCurrentVampId();

  return (
    <MetronomeProvider>
      <GuidelineProvider>
        <SelectionProvider>
          <DraggableProvider>
            <DropZonesProvider>
              <PlaybackProvider>
                <RecordingProvider>
                  <FloorOverlay></FloorOverlay>
                  <div className={styles["workspace"]}>
                    <WorkspaceScrollProvider>
                      <WorkspaceAudio vampId={vampId}></WorkspaceAudio>
                      <div className={styles["play-and-tracks"]}>
                        <div className={styles["play-panel"]}>
                          <PlayPanel></PlayPanel>
                        </div>
                        <Timeline></Timeline>
                      </div>
                    </WorkspaceScrollProvider>
                  </div>
                </RecordingProvider>
              </PlaybackProvider>
            </DropZonesProvider>
          </DraggableProvider>
        </SelectionProvider>
      </GuidelineProvider>
    </MetronomeProvider>
  );
};

export { WorkspaceContent };
