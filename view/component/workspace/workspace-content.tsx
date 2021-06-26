import * as React from "react";
import { gql, useQuery } from "@apollo/client";
import * as styles from "./workspace-content.less";
import { useCurrentVampId } from "../../util/react-hooks";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { PlayPanel } from "./play-panel/play-panel";
import Timeline from "./timeline/timeline";
import { useRef, useState, useCallback, useEffect } from "react";
import { WorkspaceContentClient } from "../../state/apollotypes";
import { useWindowDimensions } from "../../util/workspace-hooks";
import { DropZonesProvider } from "./workspace-drop-zones";
import { FloorOverlay } from "./floor/floor-overlay";
import { MetronomeProvider } from "./context/metronome-context";
import { GuidelineProvider } from "./context/guideline-context";
import { DraggableProvider } from "./context/draggable-context";

const TemporalZoomContext = React.createContext(100);
const HorizontalPosContext = React.createContext(0);

const WORKSPACE_CONTENT_CLIENT = gql`
  query WorkspaceContentClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      tracks @client {
        id @client
      }
    }
  }
`;

/**
 * Contains the content of the ViewWorkspace component (that component is
 * focused on providers and wrappers).
 *
 * Also handles worspace scrolling operations.
 */
const WorkspaceContent: React.FC = () => {
  const vampId = useCurrentVampId();

  const offsetRef = useRef<HTMLDivElement>();

  const { data } = useQuery<WorkspaceContentClient>(WORKSPACE_CONTENT_CLIENT, {
    variables: { vampId }
  });
  const tracks = data.vamp.tracks;

  const { width: windowWidth } = useWindowDimensions();

  const [trackRefTrigger, setTrackRefTrigger] = useState<boolean>(false);

  const [temporalZoom, setTemporalZoom] = useState<number>(1.0);

  const [verticalPos, setVerticalPos] = useState<number>(0.0);
  const [horizontalPos, setHorizontalPos] = useState<number>(0.0);
  const OFFSET_DEC = 0.4;
  const [horizontalPosOffset, setHoriztontalPosOffset] = useState<number>(
    windowWidth * OFFSET_DEC
  );

  const onWheel = (e: React.WheelEvent): void => {
    if (e.altKey) {
      const mouseX = e.clientX;
      const mouseOffset = mouseX - (horizontalPos + horizontalPosOffset);
      // Temporal zoom.
      const zoomMultiplier = 1 - 0.001 * e.deltaY;
      setTemporalZoom(temporalZoom * zoomMultiplier);
      if (e.deltaY < 0) {
        setHorizontalPos(horizontalPos - mouseOffset * 0.1);
      } else {
        setHorizontalPos(horizontalPos + mouseOffset * 0.1);
      }
    } else if (e.shiftKey) {
      setHorizontalPos(horizontalPos + e.deltaY * 0.75);
    } else {
      // Pretty sure e.deltaY returns different values for different browsers.
      // TODO The 100.0 here controls sensitivity and needs to be changed for
      // different input devices.
      const dist: number = e.deltaY / 100.0;
      setVerticalPos(verticalPos + dist);
    }
  };

  // const onWheel = useScrollTimeout(
  //   (dist: number, lastEvent: React.WheelEvent) => {
  //     if (lastEvent.altKey) {
  //       // Temporal zoom.
  //       setTemporalZoom(temporalZoom * (1 - 0.001 * dist));
  //     } else if (lastEvent.shiftKey) {
  //       console.log(dist);
  //       setHorizontalPos(horizontalPos + dist * 0.75);
  //     } else {
  //       // Pretty sure e.deltaY returns different values for different browsers.
  //       // TODO The 100.0 here controls sensitivity and needs to be changed for
  //       // different input devices.
  //       const dist: number = lastEvent.deltaY / 100.0;
  //       setVerticalPos(verticalPos + dist);
  //     }
  //   },
  //   100
  // );

  /**
   * The point here is to listen to changes to tracks and then trigger the
   * callback function below on *the next* update, adjusting the track heights.
   * If we just listened to this straight on the callback function, the tracks
   * component won't have been updated yet.
   */
  useEffect(() => {
    setTrackRefTrigger(true);
  }, [tracks]);

  useEffect(() => {
    setHoriztontalPosOffset(windowWidth * OFFSET_DEC);
  }, [windowWidth]);

  /**
   * Ideally we don't want scrolling to trigger any component re-renders.
   * Instead, we hold ref objects for every component that changes style on
   * scroll events. This callback function in particular will fire first when
   * the tracks container ref component gets loaded, and then whenever
   * verticalPos changes (i.e. on scroll). We *could* just use a normal useRef,
   * but there'd be no way to set that initially, since WorkspaceComponent gets
   * rendered before the ref objects do.
   */
  const trackRefUpdate = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null && node.children.length > 0) {
        // Determines the decimal height of clips when they don't need to enable
        // scrolling.
        const clipHeightNoScroll = 0.3;

        const children = node.children;
        const numTracks = tracks.length;

        if (verticalPos < 0) {
          setVerticalPos(0);
        } else if (verticalPos >= numTracks) {
          setVerticalPos(Math.max(numTracks - 1, 0));
        }

        const focusedTrack = Math.round(verticalPos);

        const rawWeights: number[] = [];
        for (let i = 0; i < numTracks; i++) {
          const indexDist = Math.abs(focusedTrack - i);
          // The exponent here determines "vertical zoom." Higher values are
          // more exaggerated.
          rawWeights.push(1.0 / Math.pow(indexDist + 1, 0.7));
        }

        const sum =
          rawWeights.length > 0
            ? rawWeights.reduce((acc, cur) => acc + cur)
            : 0;

        const gridTemplateRows = tracks
          .map((track, i) => {
            if (clipHeightNoScroll * numTracks <= 1.0) {
              return `${clipHeightNoScroll * 100}%`;
            } else {
              const clampedHeight = rawWeights[i] / sum;
              return `${clampedHeight * 100}%`;
            }
          })
          .join(" ");
        node.style.gridTemplateRows = gridTemplateRows;
      }
      setTrackRefTrigger(false);
    },
    [verticalPos, tracks, trackRefTrigger]
  );

  return (
    <MetronomeProvider>
      <GuidelineProvider>
        <TemporalZoomContext.Provider value={temporalZoom}>
          <HorizontalPosContext.Provider
            value={horizontalPos + horizontalPosOffset}
          >
            <DraggableProvider>
              <DropZonesProvider>
                <FloorOverlay></FloorOverlay>
                <div className={styles["workspace"]} onWheel={onWheel}>
                  <WorkspaceAudio vampId={vampId}></WorkspaceAudio>
                  <div className={styles["play-and-tracks"]}>
                    <div className={styles["play-panel"]}>
                      <PlayPanel></PlayPanel>
                    </div>
                    <Timeline
                      offsetRef={offsetRef}
                      tracksRef={trackRefUpdate}
                    ></Timeline>
                  </div>
                </div>
              </DropZonesProvider>
            </DraggableProvider>
          </HorizontalPosContext.Provider>
        </TemporalZoomContext.Provider>
      </GuidelineProvider>
    </MetronomeProvider>
  );
};

export { WorkspaceContent, TemporalZoomContext, HorizontalPosContext };
