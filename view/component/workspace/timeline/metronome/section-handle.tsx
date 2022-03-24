import classNames from "classnames";
import * as React from "react";
import { useContext, useRef, useState } from "react";
import { useContextMenu } from "../../../element/menu/context-menu";
import { MetronomeMenuContext } from "./metronome";
import * as styles from "./metronome.less";

interface SectionHandleProps {
  id: string;
  name?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  highlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children?: React.ReactChild[];
}

export const SectionHandle: React.FC<SectionHandleProps> = ({
  id,
  name,
  left,
  top,
  width,
  height,
  highlighted,
  onMouseEnter,
  onMouseLeave,
  children
}: SectionHandleProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { setOpenSectionMenu } = useContext(MetronomeMenuContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const { isOpen } = useContextMenu({
    headerText: name ? `Section ${name}` : "Section",
    options: [
      { component: <a>Edit section</a> },
      { component: <a>Delete section</a> }
    ],
    target: sectionRef,
    onContextMenuOpened: () => {
      setOpenSectionMenu(id, true);
      setMenuOpen(true);
    },
    onContextMenuClosed: () => {
      setOpenSectionMenu(id, false);
      setMenuOpen(false);
    }
  });

  return (
    <div
      className={styles["section-handle-container"]}
      style={{
        left,
        width: `${width}px`,
        top: `${top}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={sectionRef}
    >
      <div
        className={classNames(styles["section-handle"], styles["variant"], {
          [styles["highlighted"]]: highlighted || menuOpen
        })}
        style={{
          height: `${height}px`
        }}
      ></div>
      {children}
    </div>
  );
};
