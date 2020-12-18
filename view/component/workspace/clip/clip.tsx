import * as React from "react";

import styles = require("./clip.less");
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkpaceDuration,
  useWorkspaceTime
} from "../../../workspace-hooks";
import Playhead from "../../element/playhead";
import TrashButton from "./trash-button";
import MovableComponent from "../../element/movable-component";
import { DropZone } from "../workspace-content";
import { useEffect, useRef, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { UpdateClip } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";
import { FailureOverlay } from "./failure-overlay";

const UPDATE_CLIP = gql`
  mutation UpdateClip($clipUpdate: UpdateClipInput!) {
    updateClip(clipUpdate: $clipUpdate) {
      id
    }
  }
`;

interface ClipProps {
  index: number;
  trackIndex: number;
  clip: {
    id: string;
    start: number;
    duration: number;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
      error: string | null;
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
  const durationFn = useWorkpaceDuration();
  const leftFn = useWorkspaceLeft();
  const timeFn = useWorkspaceTime();

  const clipRef = useRef<HTMLDivElement>();
  const clipHeight = clipRef.current ? clipRef.current.clientHeight : 0;

  const [updateClip] = useMutation<UpdateClip>(UPDATE_CLIP);

  // This is the temporary track index used while dragging.
  const [trackIndexState, setTrackIndexState] = useState(trackIndex);
  useEffect(() => {
    setTrackIndexState(trackIndex);
  }, [trackIndex]);

  const [raised, setRaised] = useState(false);

  const opacity = clip.audio.storedLocally ? 1.0 : 0.7;

  const left =
    clip.draggingInfo.dragging || clip.draggingInfo.track
      ? leftFn(clip.draggingInfo.position)
      : leftFn(clip.start);

  const width = clip.audio.storedLocally ? widthFn(clip.audio.duration) : 200;

  const boxShadow = raised ? "2px 2px rgba(0, 0, 0, 0.2)" : undefined;

  return (
    <MovableComponent
      initialWidth={width}
      height={"100%"}
      initialLeft={left}
      initialMoving={clip.draggingInfo.dragging}
      className={styles["clip-movable"]}
      dropZonesFilter={(dropZone): boolean => dropZone.class === "Track"}
      onChangeZone={(zone: DropZone<{ index: number }>): void => {
        setTrackIndexState(zone.metadata.index);
      }}
      onDrop={(zone: DropZone<{ index: number }>): void => {
        if (!clip.audio.error)
          updateClip({
            variables: {
              clipUpdate: {
                vampId,
                clipId: clip.id,
                trackIndex: zone.metadata.index
              }
            }
          });
      }}
      onWidthChanged={(newWidth): void => {
        if (!clip.audio.error)
          updateClip({
            variables: {
              clipUpdate: {
                vampId,
                clipId: clip.id,
                duration: durationFn(newWidth)
              }
            }
          });
      }}
      onLeftChanged={(newLeft): void => {
        if (!clip.audio.error)
          updateClip({
            variables: {
              clipUpdate: { vampId, clipId: clip.id, start: timeFn(newLeft) }
            }
          });
      }}
      onAdjust={(moving, resizing): void => {
        setRaised(moving);
      }}
      onClick={(click): void => {}}
      style={{
        gridRowStart: trackIndexState + 1,
        gridRowEnd: trackIndexState + 1
      }}
    >
      <div className={styles["clip"]} ref={clipRef} style={{ boxShadow }}>
        <div className={styles["foreground"]}>
          <TrashButton clipId={clip.id}></TrashButton>
        </div>
        <div className={styles["background"]} style={{ opacity }}>
          <Playhead containerStart={clip.start} />
          {clip.audio.error ? (
            <FailureOverlay
              error={clip.audio.error}
              height={clipHeight}
            ></FailureOverlay>
          ) : (
            <Oscilloscope
              audio={clip.audio}
              dimensions={{
                width: width
              }}
            ></Oscilloscope>
          )}
        </div>
      </div>
    </MovableComponent>
  );
};

export default Clip;
