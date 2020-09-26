import * as React from "react";

import * as styles from "./workspace-content.less";
import { useCurrentVampId } from "../../react-hooks";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { PlayPanel } from "./play-panel/play-panel";
import Timeline from "./timeline/timeline";
import { useRef, useState, useCallback, useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { WorkspaceContentClient } from "../../state/apollotypes";
import { i } from "mathjs";

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

  const onWheel = (e: React.WheelEvent): void => {
    if (e.altKey) {
      // Temporal zoom.
      const dist: number = e.deltaY > 0 ? 0.9 : 1.1;
      setTemporalZoom(temporalZoom * dist);
    } else if (e.shiftKey) {
      const dist: number = e.deltaY > 0 ? 40 : -40;
      setHorizontalPos(horizontalPos + dist);
      offsetRef.current.style.left = `${horizontalPos}px`;
    } else {
      // Pretty sure e.deltaY returns different values for different browsers.
      const dist: number = e.deltaY > 0 ? 0.075 : -0.075;
      setVerticalPos(Math.min(1.0, Math.max(0.0, verticalPos + dist)));
    }
  };

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
        const maxHeight = 0.3;

        const children = node.children;
        const unnormalized = [];

        for (let i = 0; i < children.length; i++) {
          const trackPos = i / children.length;
          const distFromPosition = Math.abs(verticalPos - trackPos);
          unnormalized.push(Math.min(0.9, Math.max(0.1, 1 - distFromPosition)));
        }

        // TODO: Quick fix for that Type error
        const sum =
          unnormalized.length > 0
            ? unnormalized.reduce((acc, cur) => acc + cur)
            : 0;

        for (let i = 0; i < children.length; i++) {
          const child = node.children.item(i) as HTMLElement;
          if (sum <= 1.0) {
            child.style.height = `${maxHeight * 100}%`;
          } else {
            const clampedHeight = Math.min(maxHeight, unnormalized[i] / sum);
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
