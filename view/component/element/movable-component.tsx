import * as React from "react";
import * as styles from "./movable-component.less";
import { useState, useEffect, useRef, useContext } from "react";
import { usePrevious } from "../../util/react-hooks";
import {
  useWorkspaceTime,
  useSnapToBeat,
  useWorkspaceLeft
} from "../../util/workspace-hooks";
import _ = require("underscore");
import classNames = require("classnames");
import { DropZone, DropZonesContext } from "../workspace/workspace-drop-zones";

interface MovableComponentProps {
  initialWidth: number;
  height: string;

  /**
   * Sets the left position state of the component via prop.
   */
  initialLeft: number;

  /**
   * Sets the moving state of the component via prop.
   */
  initialMoving?: boolean;

  className?: string;

  /**
   * This is essentially a filter function that checks every registered drop
   * zone to see if you should be able to move this component there.
   */
  dropZonesFilter?: (dropZone: DropZone) => boolean;

  /**
   * Called when the item is dropped, with the zone it's dropped into as a
   * parameter.
   */
  onDrop?: (dropZone: DropZone<any>) => void;

  /**
   * Fired when the movable component is dragged, dropped, started to be
   * resized, and finished being resized.
   */
  onAdjust?: (moving: boolean, resizing: boolean) => void;

  /**
   * This is called when an item being dragged is moved to anopther zone that
   * gets applied via dropZonesFilter. This will get called when the item is
   * still being dragged.
   */
  onChangeZone?: (zone: DropZone<any>, time: number) => void;

  /**
   * Called on mouse up when the width of the item is changed.
   */
  onWidthChanged?: (newWidth: number) => void;

  /**
   * Called on mouse up when the left position of the item is changed. I.e. this
   * doesn't get called while currently dragging, only when dropped.
   */
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
  onDrop,
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

  const timeFn = useWorkspaceTime();
  const leftFn = useWorkspaceLeft();
  const snapToBeatsFn = useSnapToBeat();

  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });

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
  const [leftOnMouseDown, setLeftOnMouseDown] = useState(-1);
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
    if (initialLeft !== left && !moving) {
      setLeft(initialLeft);
    }
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
        setLeftOnMouseDown(left);
      }
    }
  }, [mousePos]);

  useEffect(() => {
    setMoving(initialMoving);
  }, [initialMoving]);

  useEffect(() => {
    if (prevZone && zone) {
      if (zone.id !== prevZone.id) {
        onChangeZone(zone, timeFn(left));
      }
    }
  }, [zone]);

  const onMouseMove = (e: MouseEvent): void => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (leftDragging) {
      const timeLeft = timeFn(e.clientX);
      const beatTime = snapToBeatsFn(timeLeft);
      const leftPos = leftFn(beatTime);

      setWidth(width + left - leftPos);
      setLeft(leftPos);
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
      const newLeft = leftOnMouseDown + e.clientX - moveDown;
      const time = timeFn(newLeft);
      // Time in seconds of nearest beat to snap to.
      const beatTime = snapToBeatsFn(time);
      setLeft(leftFn(beatTime));
    }
  };

  const onMouseUpWindow = (): void => {
    onAdjust(false, leftDragging || rightDragging);
    setLeftDragging(false);
    setRightDragging(false);
    setMoving(false);
    setMoveDown(-1);
    setLeftOnMouseDown(-1);
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
        onDrop && onDrop(zone);
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
  }, [
    leftDragging,
    rightDragging,
    moving,
    moveDown,
    onLeftChanged,
    onWidthChanged,
    zone
  ]);

  return (
    <div
      className={classNames(
        styles["draggable-container"],
        className,
        moving && styles["draggable-container-dragging"]
      )}
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
            setLeftOnMouseDown(left);
            onAdjust(true, true);
          }}
        ></div>
        <div
          className={styles["draggable-center"]}
          onMouseDown={(e): void => {
            e.preventDefault();
            setMoving(true);
            setMoveDown(e.clientX);
            setLeftOnMouseDown(left);
            onAdjust(true, false);
          }}
          onMouseUp={(e: React.MouseEvent): void => {
            e.preventDefault();
            // This will evaluate to true when the clip was not moved (note, not
            // that the *mouse* was not moved).
            if (
              e.button === 0 &&
              prevData.moveDown === -1 &&
              !(leftDragging || rightDragging)
            ) {
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
