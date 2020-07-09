import * as React from "react";

import * as styles from "./workspace-content.less";
import { useCurrentVampId } from "../../react-hooks";
import { WorkspaceAudio } from "../../audio/vamp-audio";
import { PlayPanel } from "./play-panel/play-panel";
import Timeline from "./timeline/timeline";
import { useMutation } from "react-apollo";
import {
  SetViewLeftClient,
  SetTemporalZoomClient
} from "../../state/apollotypes";
import {
  SET_VIEW_LEFT_CLIENT,
  SET_TEMPORAL_ZOOM_CLIENT
} from "../../state/queries/vamp-mutations";
import { useRef } from "react";
import { useWorkspaceLeft } from "../../workspace-hooks";

/**
 * Contains the content of the ViewWorkspace component (that component is
 * focused on providers and wrappers).
 *
 * Also handles worspace scrolling operations.
 */
const WorkspaceContent: React.FC = () => {
  const vampId = useCurrentVampId();
  const leftFn = useWorkspaceLeft();

  // const [setViewLeftClient] = useMutation<SetViewLeftClient>(
  //   SET_VIEW_LEFT_CLIENT
  // );

  const [setTemporalZoom] = useMutation<SetTemporalZoomClient>(
    SET_TEMPORAL_ZOOM_CLIENT
  );

  const offsetRef = useRef<HTMLDivElement>();

  const onWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    if (e.altKey) {
      // Temporal zoom.
      const dist: number = e.deltaY > 0 ? 0.9 : 1.1;

      setTemporalZoom({ variables: { temporalZoom: dist, cumulative: true } });
    } else {
      // Pretty sure e.deltaY returns different values for different browsers.
      const dist: number = e.deltaY > 0 ? 0.7 : -0.7;

      const prevLeft = getComputedStyle(offsetRef.current).getPropertyValue(
        "left"
      );
      const prevLeftNo: number = parseInt(
        prevLeft.substring(0, prevLeft.length - 2)
      );

      const left = `${leftFn(dist) + prevLeftNo}px`;
      if (offsetRef.current) offsetRef.current.style.left = left;

      // setViewLeftClient({
      //   variables: { viewLeft: dist, cumulative: true }
      // });
    }
  };

  return (
    <div className={styles["workspace"]} onWheel={onWheel}>
      <WorkspaceAudio vampId={vampId}></WorkspaceAudio>
      <div className={styles["play-and-tracks"]}>
        <div className={styles["play-panel"]}>
          <PlayPanel></PlayPanel>
        </div>
        <Timeline offsetRef={offsetRef}></Timeline>
      </div>
    </div>
  );
};

export default WorkspaceContent;
