import classNames from "classnames";
import * as React from "react";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { useContextMenu } from "../../../element/menu/context-menu";
import { useMetronomeDimensions } from "../../context/metronome-context";
import { WorkspaceScrollContext } from "../../context/workspace-scroll-context";
import { MetronomeMenuContext } from "./metronome";
import * as styles from "./metronome.less";

interface BarProps {
  num: number;
  depth: number;
  left: number;
  top: number;
  width: number;
  label?: string;
  bpm: number;
  beats: number;
  highlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children?: React.ReactChildren | React.ReactChild;
}

export const Bar: React.FC<BarProps> = ({
  num,
  depth,
  left,
  top,
  width,
  label,
  bpm,
  beats,
  highlighted,
  onMouseEnter,
  onMouseLeave,
  children
}: BarProps) => {
  const { barHeight } = useMetronomeDimensions();

  const barRef = useRef<HTMLDivElement>(null);

  const text = label || `${num}`;

  const labelRef = useRef<HTMLDivElement>();

  const { temporalZoom } = useContext(WorkspaceScrollContext);

  const renderNonFirstBeats = temporalZoom > 0.4;
  const renderMeasureNos = temporalZoom > 0.1;

  const verticalLines = useMemo(() => {
    const lines: JSX.Element[] = [];

    for (let i = 0; i < beats; i++) {
      if (!renderNonFirstBeats && i > 0) break;

      lines.push(
        <div
          key={i}
          style={{ left: `${(100 * i) / beats}%` }}
          className={classNames(styles["beat-marker"], {
            [styles["first-beat"]]: i === 0,
            [styles["other-beat"]]: i !== 0
          })}
        ></div>
      );
    }

    return lines;
  }, [beats, renderNonFirstBeats]);

  const [showCursor, setShowCursor] = useState(false);
  const [cursorX, setCursorX] = useState(0);

  const { setMetronomeMenuOpen } = useContext(MetronomeMenuContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const { isOpen } = useContextMenu({
    headerText: `Bar ${num}`,
    options: [],
    target: barRef,
    onContextMenuOpened: () => {
      setMetronomeMenuOpen({ measureNum: num });
      setMenuOpen(true);
    },
    onContextMenuClosed: () => {
      setMetronomeMenuOpen({});
      setMenuOpen(false);
    }
  });

  const mouseEnter = useCallback(() => {
    setShowCursor(true);
    onMouseEnter();
  }, [onMouseEnter]);

  const mouseLeave = useCallback(() => {
    setShowCursor(false);
    onMouseLeave();
  }, [onMouseLeave]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setCursorX(e.clientX - barRef.current.getBoundingClientRect().left);
    },
    [barRef]
  );

  return (
    <div
      style={{
        left,
        height: `${barHeight}px`,
        width: `${width}px`,
        top: `${top}px`
      }}
      ref={barRef}
      className={classNames(styles["bar"], {
        [styles["variant"]]: depth !== 0,
        [styles["menu-open"]]: isOpen,
        [styles["highlighted"]]: menuOpen || highlighted
      })}
      onMouseMove={onMouseMove}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      {showCursor && (
        <div
          className={styles["mouseCursorLine"]}
          style={{ left: cursorX }}
        ></div>
      )}
      {children}
      {renderMeasureNos && (
        <div className={styles["label"]} ref={labelRef}>
          {text}
        </div>
      )}
      {verticalLines}
    </div>
  );
};
