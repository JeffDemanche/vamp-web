import * as React from "react";

import styles = require("./clip.less");
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkspaceDuration,
  useWorkspaceTime
} from "../../../util/workspace-hooks";
import Playhead from "../../element/playhead";
import TrashButton from "./trash-button";
import MovableComponent from "../../element/movable-component";
import { useEffect, useMemo, useRef, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { UpdateClip } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";
import { FailureOverlay } from "./failure-overlay";
import { DropZone } from "../workspace-drop-zones";
import { ClipContentAudio } from "./content/clip-content-audio";

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
    content: {
      start: number;
      duration: number;
      type: string;
      audio: {
        id: string;
        filename: string;
        storedLocally: boolean;
        localFilename: string;
        latencyCompensation: number;
        duration: number;
        error: string | null;
      };
    }[];
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
  const durationFn = useWorkspaceDuration();
  const leftFn = useWorkspaceLeft();
  const timeFn = useWorkspaceTime();

  const clipRef = useRef<HTMLDivElement>();
  const clipHeight = clipRef.current ? clipRef.current.clientHeight : 0;

  const [updateClip] = useMutation<UpdateClip>(UPDATE_CLIP);

  // This is the temporary track index used while dragging.
  const [trackIndexState, setTrackIndexState] = useState(trackIndex);

  // If the props change, make sure the state changes accordingly.
  useEffect(() => {
    setTrackIndexState(trackIndex);
  }, [trackIndex]);

  const [raised, setRaised] = useState(false);

  const opacity = clip.content.every(content => content.audio.storedLocally)
    ? 1.0
    : 0.7;

  const audioErrors = clip.content
    .map(content => content.audio.error)
    .filter(error => error !== null);

  const left =
    clip.draggingInfo.dragging || clip.draggingInfo.track
      ? leftFn(clip.draggingInfo.position)
      : leftFn(clip.start);

  const width = widthFn(clip.duration);

  const boxShadow = raised ? "2px 2px rgba(0, 0, 0, 0.2)" : undefined;

  const audioContent = useMemo(() => {
    const elements: JSX.Element[] = [];
    clip.content.forEach((content, i) => {
      if (content.type === "AUDIO") {
        elements.push(
          <ClipContentAudio key={i} content={content}></ClipContentAudio>
        );
      }
    });
    return elements;
  }, [clip.content]);

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
        if (audioErrors.length === 0)
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
        if (audioErrors.length === 0)
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
        if (audioErrors.length === 0)
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
          {audioErrors.length > 0 ? (
            <FailureOverlay
              // TODO this is currently just displaying the first error.
              error={audioErrors[0]}
              height={clipHeight}
            ></FailureOverlay>
          ) : (
            audioContent
          )}
        </div>
      </div>
    </MovableComponent>
  );
};

export default Clip;
