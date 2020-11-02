import * as React from "react";

import styles = require("./clip.less");
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import { useWorkspaceWidth, useWorkspaceLeft } from "../../../workspace-hooks";
import Playhead from "../../element/playhead";
import TrashButton from "./trash-button";
import MovableComponent from "../../element/movable-component";
import { DropZone } from "../workspace-content";
import { useApolloClient, useMutation } from "react-apollo";
import { useCurrentVampId } from "../../../react-hooks";
import { gql } from "apollo-boost";
import { SetClipDraggingInfo } from "../../../state/apollotypes";
import { useState } from "react";

const SET_CLIP_DRAGGING_INFO = gql`
  mutation SetClipDraggingInfo($clipId: ID!, $info: ClipDraggingInfo!) {
    setClipDraggingInfo(clipId: $clipId, info: $info) @client
  }
`;

interface ClipProps {
  index: number;
  trackIndex: number;
  clip: {
    id: string;
    start: number;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
    };
    draggingInfo: {
      dragging?: boolean;
      track?: string;
      position?: number;
      downPosX?: number;
    };
  };
}

const Clip: React.FunctionComponent<ClipProps> = ({
  index,
  trackIndex,
  clip
}: ClipProps) => {
  const vampId = useCurrentVampId();

  const widthFn = useWorkspaceWidth();
  const leftFn = useWorkspaceLeft();

  const client = useApolloClient();

  const [setClipDraggingInfo] = useMutation<SetClipDraggingInfo>(
    SET_CLIP_DRAGGING_INFO
  );

  const synced = clip.audio.filename !== "" ? "" : "not synced";

  const opacity = clip.audio.storedLocally ? 1.0 : 0.7;

  const left =
    clip.draggingInfo.dragging || clip.draggingInfo.track
      ? leftFn(clip.draggingInfo.position)
      : leftFn(clip.start);

  const width = widthFn(clip.audio.duration);

  // This is the temporary track index used while dragging.
  const [trackIndexState, setTrackIndexState] = useState(trackIndex);
  const [raised, setRaised] = useState(false);

  const boxShadow = raised ? "2px 2px rgba(0, 0, 0, 0.2)" : undefined;

  return (
    <MovableComponent
      initialWidth={width}
      height={"100%"}
      initialLeft={left}
      initialMoving={clip.draggingInfo.dragging}
      className={styles["clip-movable"]}
      dropZonesFilter={(dropZone): boolean => dropZone.class === "Track"}
      onChangeZone={(zone: DropZone<{ index: number }>, time: number): void => {
        setTrackIndexState(zone.metadata.index);
      }}
      onWidthChanged={(newWidth): void => {}}
      onLeftChanged={(newLeft): void => {}}
      onAdjust={(active, resizing): void => {
        setRaised(active);
        // if (!resizing) {
        //   if (active) {
        //     setClipDraggingInfo({
        //       variables: {
        //         clipId: clip.id,
        //         info: { dragging: true }
        //       }
        //     });
        //   } else {
        //     setClipDraggingInfo({
        //       variables: {
        //         clipId: clip.id,
        //         info: { dragging: false }
        //       }
        //     });
        //   }
        // }
      }}
      onClick={(click): void => {}}
      style={{
        gridRowStart: trackIndexState + 1,
        gridRowEnd: trackIndexState + 1
      }}
    >
      <div className={styles["clip"]} style={{ opacity, boxShadow }}>
        <div className={styles["display-on-hover"]}>
          <TrashButton clipId={clip.id}></TrashButton>
        </div>
        <Playhead
          containerStart={clip.start}
          containerDuration={clip.audio.duration}
        />
        <Oscilloscope
          audio={clip.audio}
          dimensions={{
            width: width
          }}
        ></Oscilloscope>
        {synced}
      </div>
    </MovableComponent>
  );
};

export default Clip;
