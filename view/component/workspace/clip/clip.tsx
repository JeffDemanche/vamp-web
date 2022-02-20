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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { gql, useMutation } from "@apollo/client";
import { UpdateClip } from "../../../state/apollotypes";
import { useCurrentVampId, usePrevious } from "../../../util/react-hooks";
import { FailureOverlay } from "./failure-overlay";
import { ClipContentAudio } from "./content/clip-content-audio";
import { TimelineDraggable } from "../timeline/timeline-draggable";
import { MetronomeContext } from "../context/metronome-context";
import { GuidelineContext } from "../context/guideline-context";
import { WorkspaceScrollContext } from "../context/workspace-scroll-context";

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
      offset: number;
      type: string;
      audio: {
        id: string;
        filename: string;
        storedLocally: boolean;
        localFilename: string;
        duration: number;
        error: string | null;
      };
    }[];
  };
}

const Clip: React.FunctionComponent<ClipProps> = ({
  index,
  trackIndex,
  clip
}: ClipProps) => {
  const { setIsShowing, setStart, setEnd } = useContext(GuidelineContext);

  const vampId = useCurrentVampId();

  const widthFn = useWorkspaceWidth();
  const durationFn = useWorkspaceDuration();
  const leftFn = useWorkspaceLeft();
  const timeFn = useWorkspaceTime();

  const { temporalZoom, horizontalPos } = useContext(WorkspaceScrollContext);
  const prevHorizontalPos = usePrevious(horizontalPos);
  const prevTemporalZoom = usePrevious(temporalZoom);

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

  const prevClipStart = usePrevious(clip.start);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (prevClipStart !== clip.start || horizontalPos !== prevHorizontalPos) {
      setLeft(leftFn(clip.start));
    }
  }, [clip.start, horizontalPos, leftFn, prevClipStart, prevHorizontalPos]);
  const [deltaLeft, setDeltaLeft] = useState(0);

  const { snapToBeat } = useContext(MetronomeContext);

  // TimelineDraggable accepts an arbitrary snap function that transforms a
  // delta into a "snapped delta". We have to some timeline transformations to
  // get that to actually snap to the beats.
  const snapFn = useCallback(
    (deltaX: number): number => {
      return leftFn(snapToBeat(timeFn(left + deltaX))) - left;
    },
    [left, leftFn, snapToBeat, timeFn]
  );

  const prevClipDuration = usePrevious(clip.duration);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (
      prevClipDuration !== clip.duration ||
      temporalZoom !== prevTemporalZoom
    ) {
      setWidth(widthFn(clip.duration));
    }
  }, [
    clip.duration,
    prevClipDuration,
    prevTemporalZoom,
    temporalZoom,
    widthFn
  ]);
  const [deltaWidth, setDeltaWidth] = useState(0);

  const boxShadow = raised ? "2px 2px rgba(0, 0, 0, 0.2)" : undefined;

  const [hovering, setHovering] = useState(false);

  const audioContent = useMemo(() => {
    const elements: JSX.Element[] = [];
    clip.content.forEach((content, i) => {
      if (content.type === "AUDIO") {
        elements.push(
          <ClipContentAudio
            key={i}
            content={content}
            hoveringClip={hovering}
            index={i}
            total={clip.content.length}
          ></ClipContentAudio>
        );
      }
    });
    return elements;
  }, [clip.content, hovering]);

  return (
    <TimelineDraggable
      id={`clip${clip.id}`}
      left={`${left + deltaLeft}px`}
      width={`${width + deltaWidth}px`}
      height="100%"
      style={{
        gridRowStart: trackIndexState + 1,
        gridRowEnd: trackIndexState + 1
      }}
      className={styles["clip-movable"]}
      dropzoneTypes={["Track"]}
      snapFn={snapFn}
      onDragBegin={(): void => {
        setRaised(true);
        setIsShowing(true);
      }}
      onDragDelta={([x], handle): void => {
        if (handle === "move") {
          setDeltaLeft(x);
        }
        if (handle === "left") {
          setDeltaLeft(x);
          setDeltaWidth(-x);
        }
        if (handle === "right") {
          setDeltaWidth(x);
        }

        setStart(timeFn(left + deltaLeft));
        setEnd(timeFn(left + deltaLeft) + durationFn(width + deltaWidth));
      }}
      onDragEnd={(pos, zones, handle): void => {
        const trackIndex =
          handle === "move"
            ? zones.find(zone => zone.type === "Track")?.trackIndex
            : undefined;

        if (audioErrors.length === 0) {
          updateClip({
            variables: {
              clipUpdate: {
                vampId,
                clipId: clip.id,
                start: timeFn(left + deltaLeft),
                duration: durationFn(width + deltaWidth),
                trackIndex: trackIndex
              }
            }
          }).then(() => {
            setRaised(false);
          });
          setIsShowing(false);

          setLeft(left + deltaLeft);
          setWidth(width + deltaWidth);
          setDeltaLeft(0);
          setDeltaWidth(0);
        }
      }}
      onDragIntoZone={(zone, handle): void => {
        if (zone.type === "Track" && handle === "move")
          setTrackIndexState(zone.trackIndex);
      }}
      divProps={{
        onMouseEnter: (): void => {
          setHovering(true);
        },
        onMouseLeave: (): void => {
          setHovering(false);
        }
      }}
    >
      <div className={styles["clip"]} ref={clipRef} style={{ boxShadow }}>
        <div className={styles["foreground"]}>
          <TrashButton clipId={clip.id}></TrashButton>
        </div>
        <div className={styles["background"]} style={{ opacity }}>
          {!raised && <Playhead containerStart={clip.start} />}
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
    </TimelineDraggable>
  );
};

export default Clip;
