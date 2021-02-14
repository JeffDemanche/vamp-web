import classNames = require("classnames");
import * as React from "react";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { usePrevious } from "../../../util/react-hooks";

import * as styles from "./overlay.less";

interface OverlayProps {
  opened: boolean;
  close: () => void;
  backgroundDarken: number;
  backgroundBlur: number;
  absolute?: { top?: string; left?: string; width: string; height: string };
  padding?: number;
  rgba?: string;
  children?: React.ReactChild | React.ReactChild[];
}

/**
 * Component for an overlay. Don't use this directly, use the hook below, which
 * will return a component that can be included in the DOM tree.
 */
const Overlay: React.FC<OverlayProps> = ({
  opened,
  close,
  backgroundDarken,
  backgroundBlur,
  absolute,
  padding,
  rgba,
  children
}: OverlayProps) => {
  const containerClassName = opened
    ? classNames(styles["overlay-screen-container"], styles["opened"])
    : styles["overlay-screen-container"];

  const containerStyle: React.CSSProperties = {};
  if (backgroundDarken)
    containerStyle.backgroundColor = `rgba(0, 0, 0, ${backgroundDarken})`;
  if (backgroundBlur)
    containerStyle.backdropFilter = `blur(${backgroundBlur}px)`;

  const bubbleStyle: React.CSSProperties = {};
  if (absolute) {
    if (absolute.top !== undefined) {
      bubbleStyle.top = absolute.top;
    } else {
      bubbleStyle.marginTop = "auto";
      bubbleStyle.marginBottom = "auto";
      bubbleStyle.top = "50%";
      bubbleStyle.msTransform = "translateY(-50%)";
      bubbleStyle.transform = "translateY(-50%)";
    }

    if (absolute.left !== undefined) {
      bubbleStyle.left = absolute.left;
    } else {
      bubbleStyle.marginLeft = "auto";
      bubbleStyle.marginRight = "auto";
    }

    bubbleStyle.width = absolute.width;
    bubbleStyle.height = absolute.height;
  }

  bubbleStyle.padding = padding ? `${padding}px` : "10px";
  bubbleStyle.backgroundColor = rgba ? rgba : "rgba(0, 0, 0, 0.8)";

  return (
    <>
      <div
        className={containerClassName}
        style={containerStyle}
        onClick={close}
      >
        <div
          className={styles["overlay-bubble"]}
          style={bubbleStyle}
          onClick={(e): void => {
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

interface OverlayElementProps {
  children?: React.ReactChild | React.ReactChild[];
}

interface OverlayOptions {
  backgroundDarken?: number;
  backgroundBlur?: number;
  absolute?: { top?: string; left?: string; width: string; height: string };
  targeted?: {};
  rgba?: string;
  padding?: number;

  onOpened?: () => void;
  onClosed?: () => void;
}

/**
 * Returns tools for managing an overlay and it's contents. See usage in
 * `overlay.stories.tsx`.
 */
export const useOverlay = <T,>(
  options: OverlayOptions
): {
  Overlay: React.FC<OverlayElementProps>;
  targetRef: MutableRefObject<T>;
  open: () => void;
  close: () => void;
} => {
  const [opened, setOpened] = useState(false);

  const prevOpened = usePrevious(opened);

  useEffect(() => {
    if (opened === true && prevOpened === false) {
      options.onOpened && options.onOpened();
    } else if (opened === false && prevOpened === true) {
      options.onClosed && options.onClosed();
    }
  }, [opened, options, prevOpened]);

  const element: React.FC<OverlayElementProps> = (
    props: OverlayElementProps
  ) => {
    return (
      <Overlay
        opened={opened}
        close={(): void => {
          setOpened(false);
        }}
        backgroundDarken={options.backgroundDarken}
        backgroundBlur={options.backgroundBlur}
        absolute={options.absolute}
        rgba={options.rgba}
        padding={options.padding}
      >
        {props.children}
      </Overlay>
    );
  };

  const targetRef = useRef(null);

  return {
    Overlay: element,
    targetRef,
    open: (): void => {
      setOpened(true);
    },
    close: (): void => {
      setOpened(false);
    }
  };
};
