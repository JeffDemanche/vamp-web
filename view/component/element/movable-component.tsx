import * as React from "react";
import * as styles from "./movable-component.less";
import { useState, useEffect, useRef } from "react";
import { usePrevious } from "../../react-hooks";
import {
  useWorkpaceDuration,
  useWorkspaceTime,
  useSnapToBeat,
  useWorkspaceLeft
} from "../../workspace-hooks";

interface MovableComponentProps {
  initialWidth: number;
  height: number;
  initialLeft: number;

  onWidthChanged?: (newWidth: number) => void;
  onLeftChanged?: (newLeft: number) => void;

  handleWidth?: number;
  children: React.ReactChild | React.ReactChildren;
}

/**
 * A wrapper for React components that can be moved and resized, including
 * clips, the cab, and potentially more. Should be placed inside a container
 * with the dimensions of whatever it is that's being moved/resized.
 */
const MovableComponent: React.FC<MovableComponentProps> = ({
  initialWidth,
  height,
  initialLeft,

  onWidthChanged,
  onLeftChanged,

  handleWidth,
  children
}: MovableComponentProps) => {
  console.log(initialLeft, initialWidth);
  const draggableRef = useRef<HTMLDivElement>();

  const durationFn = useWorkpaceDuration();
  const timeFn = useWorkspaceTime();
  const leftFn = useWorkspaceLeft();
  const snapToBeatsFn = useSnapToBeat();

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

  const onMouseMove = (e: MouseEvent): void => {
    const rect = draggableRef.current.getBoundingClientRect();

    if (leftDragging) {
      // TODO needs to be f'd with
      // setWidth(widthOnLeftDrag - (e.clientX - moveDown));
      // setLeft(left + e.clientX - moveDown);
    }
    if (rightDragging) {
      const newRight = left + e.clientX - rect.x;
      const time = timeFn(newRight);
      const beatTime = snapToBeatsFn(time);
      // Position of snapped right bound of clip, in pixels.
      const snappedRight = leftFn(beatTime);
      setWidth(snappedRight - left);
      //setWidth(e.clientX - rect.x);
    }
    if (moving) {
      const newLeft = left + e.clientX - moveDown;
      const time = timeFn(newLeft);
      // Time in seconds of nearest beat to snap to.
      const beatTime = snapToBeatsFn(time);
      setLeft(leftFn(beatTime));
    }
  };

  const prevData = usePrevious({
    width: widthRef.current,
    left: leftRef.current
  });

  const onMouseUpWindow = (): void => {
    setWidthOnLeftDrag(-1);
    setLeftDragging(false);
    setRightDragging(false);
    setMoving(false);
    setMoveDown(-1);

    // TODO We should only call these if the width/left changed.
    if (prevData.width !== widthRef.current && (rightDragging || leftDragging))
      onWidthChanged && onWidthChanged(widthRef.current);
    if (prevData.left !== leftRef.current)
      onLeftChanged && onLeftChanged(leftRef.current);
  };

  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUpWindow);

    return (): void => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUpWindow);
    };
  }, [leftDragging, rightDragging, moving]);

  return (
    <div
      className={styles["draggable-container"]}
      style={{ width, height, marginLeft: left }}
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
          }}
        ></div>
        <div
          className={styles["draggable-center"]}
          onMouseDown={(e): void => {
            e.preventDefault();
            setMoving(true);
            setMoveDown(e.clientX);
          }}
        ></div>
        <div
          className={styles["draggable-right"]}
          style={{ width: handleWidth }}
          onMouseDown={(e): void => {
            e.preventDefault();
            setRightDragging(true);
          }}
        ></div>
      </div>
      {children}
    </div>
  );
};

export default MovableComponent;
