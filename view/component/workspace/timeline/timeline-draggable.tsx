import classNames from "classnames";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import _ from "underscore";
import { DraggableContext, Dropzone } from "../context/draggable-context";
import * as styles from "./timeline-draggable.less";

interface TimelineDraggableProps {
  id: string;

  left: React.CSSProperties["left"];
  height: React.CSSProperties["height"];
  width: React.CSSProperties["width"];

  dropzoneTypes?: string[];

  snapFn?: (deltaX: number) => number;

  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  onDragBegin?: (pos: number[], handle: CurrentlyDragging) => void;
  onDragDelta?: (delta: number[], handle: CurrentlyDragging) => void;
  onDragEnd?: (
    delta: number[],
    zones: Dropzone[],
    handle: CurrentlyDragging
  ) => void;
  onDragOutOfZone?: (dropzone: Dropzone, handle: CurrentlyDragging) => void;
  onDragIntoZone?: (dropzone: Dropzone, handle: CurrentlyDragging) => void;

  handleWidth?: React.CSSProperties["width"];

  className?: string;
  style?: React.CSSProperties;

  children: React.ReactChild | React.ReactChildren;
}

type CurrentlyDragging = "left" | "move" | "right" | "none";

/**
 * A wrapper component for clips and cabs that allows them to be dragged within
 * the timeline.
 */
export const TimelineDraggable: React.FC<TimelineDraggableProps> = ({
  id,
  left,
  height,
  width,
  dropzoneTypes,
  snapFn,
  onClick,
  onDragBegin,
  onDragDelta,
  onDragEnd,
  onDragOutOfZone,
  onDragIntoZone,
  handleWidth,
  className,
  style,
  children
}: TimelineDraggableProps) => {
  handleWidth = handleWidth ?? "20px";

  const {
    registerDraggable,
    removeDraggable,
    getHoveredDropzones
  } = useContext(DraggableContext);

  const [currentlyDragging, setCurrentlyDragging] = useState<CurrentlyDragging>(
    "none"
  );

  const [dragStart, setDragStart] = useState([NaN, NaN]);
  const [dragDelta, setDragDelta] = useState([NaN, NaN]);

  const [prevZones, setPrevZones] = useState<Dropzone[]>(null);

  useEffect(() => {
    registerDraggable({
      id,
      mouseUpListener: (): void => {
        setCurrentlyDragging("none");
        if (!_.isEqual(dragStart, [NaN, NaN])) {
          onDragEnd && onDragEnd(dragDelta, prevZones, currentlyDragging);
        }
      },
      mouseMoveListener: (ev: MouseEvent): void => {
        const snap = ev.shiftKey;

        // On start drag
        if (currentlyDragging !== "none" && _.isEqual(dragStart, [NaN, NaN])) {
          onDragBegin &&
            onDragBegin([ev.clientX, ev.clientY], currentlyDragging);
          setDragStart([ev.clientX, ev.clientY]);
        }
        // On finish drag
        else if (
          currentlyDragging === "none" &&
          !_.isEqual(dragStart, [NaN, NaN])
        ) {
          setDragStart([NaN, NaN]);
          setDragDelta([NaN, NaN]);
        }

        // While dragging
        if (currentlyDragging !== "none") {
          const deltaX = ev.clientX - dragStart[0];
          const snappedDeltaX = snapFn && snap ? snapFn(deltaX) : deltaX;
          setDragDelta([snappedDeltaX, ev.clientY - dragStart[1]]);

          const zones = getHoveredDropzones(
            [dragStart[0] + dragDelta[0], dragStart[1] + dragDelta[1]],
            dropzoneTypes ?? []
          );
          if (prevZones !== null) {
            const removed = _.difference(prevZones, zones);
            const added = _.difference(zones, prevZones);

            if (removed.length > 0)
              removed.forEach(zone => {
                onDragOutOfZone && onDragOutOfZone(zone, currentlyDragging);
              });

            if (added.length > 0)
              added.forEach(zone => {
                onDragIntoZone && onDragIntoZone(zone, currentlyDragging);
              });
          }

          setPrevZones(zones);
        }
      }
    });

    return (): void => {
      removeDraggable(id);
    };
    // Don't include registration functions in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    dragStart,
    setDragStart,
    dragDelta,
    setDragDelta,
    currentlyDragging,
    dropzoneTypes
  ]);

  // Calls onDragDelta handler
  useEffect(() => {
    if (currentlyDragging !== "none" && !_.isEqual(dragDelta, [NaN, NaN])) {
      onDragDelta && onDragDelta(dragDelta, currentlyDragging);
    }
  }, [
    currentlyDragging,
    dragDelta,
    dragStart,
    dropzoneTypes,
    getHoveredDropzones,
    onDragDelta,
    onDragIntoZone,
    onDragOutOfZone,
    prevZones
  ]);

  return (
    <div
      className={classNames(
        styles["draggable-container"],
        className,
        currentlyDragging === "none" && styles["use-transitions"]
      )}
      style={{ ...style, height, left, width }}
    >
      <div className={styles["handles-container"]}>
        <div
          className={styles["left-handle"]}
          style={{ width: handleWidth }}
          onMouseDown={(
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
          ): void => {
            e.preventDefault();
            setCurrentlyDragging("left");
          }}
        ></div>
        <div
          className={styles["move-handle"]}
          style={{ left: handleWidth }}
          onMouseDown={(
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
          ): void => {
            e.preventDefault();
            setCurrentlyDragging("move");
          }}
          onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
            if (isNaN(dragDelta[0]) && isNaN(dragDelta[1])) {
              onClick && onClick(e);
            }
          }}
        ></div>
        <div
          className={styles["right-handle"]}
          style={{ width: handleWidth }}
          onMouseDown={(
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
          ): void => {
            e.preventDefault();
            setCurrentlyDragging("right");
          }}
        ></div>
      </div>
      {children}
    </div>
  );
};
