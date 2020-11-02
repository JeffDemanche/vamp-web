import * as React from "react";
import * as styles from "./movable-component.less";
import { useState, useEffect, useRef, useContext } from "react";
import { usePrevious } from "../../react-hooks";
import {
  useWorkpaceDuration,
  useWorkspaceTime,
  useSnapToBeat,
  useWorkspaceLeft
} from "../../workspace-hooks";
import { DropZone, DropZonesContext } from "../workspace/workspace-content";
import _ = require("underscore");

interface MovableComponentProps {
  initialWidth: number;
  height: string;
  initialLeft: number;
  initialMoving?: boolean;

  className?: string;

  /**
   * This is essentially a filter function that checks every registered drop
   * zone to see if you should be able to move this component there.
   */
  dropZonesFilter?: (dropZone: DropZone) => boolean;

  /**
   * Fired when the movable component is dragged, dropped, started to be
   * resized, and finished being resized.
   */
  onAdjust?: (active: boolean, resizing: boolean) => void;

  onChangeZone?: (zone: DropZone<any>, time: number) => void;

  onWidthChanged?: (newWidth: number) => void;
  onLeftChanged?: (newLeft: number) => void;
  onClick?: (e: React.MouseEvent) => void;

  handleWidth?: number;
  style?: React.CSSProperties;
  children: React.ReactChild | React.ReactChild[];
}

const insideRect = (rect: DOMRect, pointX: number, pointY: number): boolean => {
  const xIn = pointX >= rect.x && pointX <= rect.x + rect.width;
  const yIn = pointY >= rect.y && pointY <= rect.y + rect.height;
  return xIn && yIn;
};

/**
 * A wrapper for React components that can be moved and resized, including
 * clips, the cab, and potentially more. Should be placed inside a container
 * with the dimensions of whatever it is that's being moved/resized.
 *
 * To fill this component, the child should have `position: absolute; height:
 * 100%; width: 100%; top: 0;`
 */
const MovableComponent: React.FC<MovableComponentProps> = ({
  initialWidth,
  height,
  initialLeft,
  initialMoving,

  className,
  dropZonesFilter,

  onAdjust,
  onChangeZone,
  onWidthChanged,
  onLeftChanged,
  onClick,

  handleWidth,
  style,
  children
}: MovableComponentProps) => {
  const draggableRef = useRef<HTMLDivElement>();

  const { dropZones } = useContext(DropZonesContext);
  const appliedDropZones =
    dropZonesFilter && dropZones?.filter(dropZonesFilter);

  const durationFn = useWorkpaceDuration();
  const timeFn = useWorkspaceTime();
  const leftFn = useWorkspaceLeft();
  const snapToBeatsFn = useSnapToBeat();

  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });

  const [widthOnLeftDrag, setWidthOnLeftDrag] = useState(-1);
  const [leftDragging, setLeftDragging] = useState(false);
  const [rightDragging, setRightDragging] = useState(false);
  const [moving, setMoving] = useState(false);

  const [width, _setWidth] = useState(initialWidth);
  const widthRef = useRef(width);
  const setWidth = (width: number): void => {
    widthRef.current = width;
    _setWidth(width);
  };

  // Stores the mouse position when the move handle was mouse down-ed.
  const [moveDown, setMoveDown] = useState(-1);
  const [left, _setLeft] = useState(initialLeft);
  const leftRef = useRef(left);

  const setLeft = (left: number): void => {
    leftRef.current = left;
    _setLeft(left);
  };

  // This is the zone being dragged over, it's null when not being dragged.
  const [zone, setZone] = useState<DropZone>(null);
  const prevZone = usePrevious(zone);

  const prevData = usePrevious({
    mousePos,
    width: widthRef.current,
    left: leftRef.current,
    moveDown
  });

  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  useEffect(() => {
    setLeft(initialLeft);
  }, [initialLeft]);

  useEffect(() => {
    if (
      prevData &&
      prevData.mousePos.x === -1 &&
      prevData.mousePos.y === -1 &&
      mousePos.x !== -1 &&
      mousePos.y !== -1
    ) {
      setMoving(initialMoving);
      if (initialMoving) {
        setMoveDown(mousePos.x);
      }
    }
  }, [mousePos]);

  useEffect(() => {
    setMoving(initialMoving);
  }, [initialMoving]);

  useEffect(() => {
    console.log("zone", prevZone, zone);
    if (prevZone && zone) {
      if (zone.id !== prevZone.id) {
        // zone is being set properly but this hook isn't catching it properly.
        //console.log("changing zone from ", prevZone.id, "to", zone.id);
        onChangeZone(zone, timeFn(left));
      }
    }
  }, [zone]);

  const onMouseMove = (e: MouseEvent): void => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (leftDragging) {
      // TODO needs to be f'd with
      // setWidth(widthOnLeftDrag - (e.clientX - moveDown));
      // setLeft(left + e.clientX - moveDown);
    }
    if (rightDragging) {
      const rect = draggableRef.current.getBoundingClientRect();
      const newRight = left + e.clientX - rect.x;
      const time = timeFn(newRight);
      const beatTime = snapToBeatsFn(time);
      // Position of snapped right bound of clip, in pixels.
      const snappedRight = leftFn(beatTime);
      setWidth(snappedRight - left);
    }
    if (moving) {
      appliedDropZones?.forEach(newZone => {
        const zoneRect = newZone.ref.current.getBoundingClientRect();
        if (insideRect(zoneRect, e.clientX, e.clientY)) {
          if (!prevZone || newZone.id !== prevZone.id) {
            setZone(newZone);
          }
        }
      });
      if (moveDown === -1) return;
      const newLeft = left + e.clientX - moveDown;
      const time = timeFn(newLeft);
      // Time in seconds of nearest beat to snap to.
      const beatTime = snapToBeatsFn(time);
      setLeft(leftFn(beatTime));
    }
  };

  const onMouseUpWindow = (): void => {
    onAdjust(false, leftDragging || rightDragging);
    setWidthOnLeftDrag(-1);
    setLeftDragging(false);
    setRightDragging(false);
    setMoving(false);
    setMoveDown(-1);
    setZone(null);

    if (prevData) {
      if (
        prevData.width !== widthRef.current &&
        (rightDragging || leftDragging)
      ) {
        onWidthChanged && onWidthChanged(widthRef.current);
      }
      if (prevData.left !== leftRef.current) {
        onLeftChanged && onLeftChanged(leftRef.current);
      }
    }
  };

  useEffect(() => {
    const debounced = _.throttle(onMouseMove, 20);
    window.addEventListener("mousemove", debounced);
    window.addEventListener("mouseup", onMouseUpWindow);

    return (): void => {
      window.removeEventListener("mousemove", debounced);
      window.removeEventListener("mouseup", onMouseUpWindow);
    };
  }, [leftDragging, rightDragging, moving, moveDown]);

  return (
    <div
      className={`${styles["draggable-container"]} ${className}`}
      style={{ ...style, width, height, left }}
    >
      <div className={styles["draggable"]} ref={draggableRef}>
        <div
          className={styles["draggable-left"]}
          style={{ width: handleWidth }}
          onMouseDown={(e): void => {
            e.preventDefault();
            setLeftDragging(true);
            setMoveDown(e.clientX);
            setWidthOnLeftDrag(
              draggableRef.current.getBoundingClientRect().width
            );
            onAdjust(true, true);
          }}
        ></div>
        <div
          className={styles["draggable-center"]}
          onMouseDown={(e): void => {
            e.preventDefault();
            setMoving(true);
            setMoveDown(e.clientX);
            onAdjust(true, false);
          }}
          onMouseUp={(e: React.MouseEvent): void => {
            e.preventDefault();
            // This will evaluate to true when the clip was not moved (note, not
            // that the *mouse* was not moved).
            if (prevData.moveDown === -1) {
              onClick(e);
            }
          }}
        ></div>
        <div
          className={styles["draggable-right"]}
          style={{ width: handleWidth }}
          onMouseDown={(e): void => {
            e.preventDefault();
            setRightDragging(true);
            onAdjust(true, true);
          }}
        ></div>
      </div>
      {children}
    </div>
  );
};

export default MovableComponent;
