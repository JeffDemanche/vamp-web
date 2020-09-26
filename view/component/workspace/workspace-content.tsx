import * as React from "react";

import * as styles from "./workspace-content.less";
import { useCurrentVampId, useScrollTimeout } from "../../react-hooks";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { PlayPanel } from "./play-panel/play-panel";
import Timeline from "./timeline/timeline";
import { useRef, useState, useCallback, useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { WorkspaceContentClient } from "../../state/apollotypes";

const TemporalZoomContext = React.createContext(100);

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

  const [trackRefTrigger, setTrackRefTrigger] = useState<boolean>(false);

  const [temporalZoom, setTemporalZoom] = useState<number>(1.0);

  const [verticalPos, setVerticalPos] = useState<number>(0.0);
  const [horizontalPos, setHorizontalPos] = useState<number>(0.0);

  const onWheel = useScrollTimeout(
    (dist: number, lastEvent: React.WheelEvent) => {
      if (lastEvent.altKey) {
        // Temporal zoom.
        const dist: number = lastEvent.deltaY > 0 ? 0.9 : 1.1;
        setTemporalZoom(temporalZoom * dist);
      } else if (lastEvent.shiftKey) {
        const dist: number = lastEvent.deltaY > 0 ? 40 : -40;
        setHorizontalPos(horizontalPos + dist);
        offsetRef.current.style.left = `${horizontalPos}px`;
      } else {
        // Pretty sure e.deltaY returns different values for different browsers.
        // TODO The 100.0 here controls sensitivity and needs to be changed for
        // different input devices.
        const dist: number = lastEvent.deltaY / 100.0;
        setVerticalPos(verticalPos + dist);
      }
    },
    100
  );

  /**
   * The point here is to listen to changes to tracks and then trigger the
   * callback function below on *the next* update, adjusting the track heights.
   * If we just listened to this straight on the callback function, the tracks
   * component won't have been updated yet.
   */
  useEffect(() => {
    setTrackRefTrigger(true);
  }, [tracks]);

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

        if (verticalPos < 0) {
          setVerticalPos(0);
        } else if (verticalPos >= children.length) {
          setVerticalPos(children.length - 1);
        }

        const focusedTrack = Math.round(verticalPos);

        const rawWeights = [];
        for (let i = 0; i < children.length; i++) {
          const indexDist = Math.abs(focusedTrack - i);
          // The exponent here determines "vertical zoom." Higher values are
          // more exaggerated.
          rawWeights.push(1.0 / Math.pow(indexDist + 1, 0.7));
        }

        const sum =
          rawWeights.length > 0
            ? rawWeights.reduce((acc, cur) => acc + cur)
            : 0;

        for (let i = 0; i < children.length; i++) {
          const child = node.children.item(i) as HTMLElement;
          if (clipHeightNoScroll * children.length <= 1.0) {
            child.style.height = `${clipHeightNoScroll * 100}%`;
          } else {
            const clampedHeight = rawWeights[i] / sum;
            child.style.height = `${clampedHeight * 100}%`;
          }
        }
      }
      setTrackRefTrigger(false);
    },
    [verticalPos, trackRefTrigger]
  );

  return (
    <TemporalZoomContext.Provider value={temporalZoom}>
      <div className={styles["workspace"]} onWheelCapture={onWheel}>
        <WorkspaceAudio vampId={vampId}></WorkspaceAudio>
        <div className={styles["play-and-tracks"]}>
          <div className={styles["play-panel"]}>
            <PlayPanel></PlayPanel>
          </div>
          <Timeline offsetRef={offsetRef} tracksRef={trackRefUpdate}></Timeline>
        </div>
      </div>
    </TemporalZoomContext.Provider>
  );
};

export { WorkspaceContent, TemporalZoomContext };
