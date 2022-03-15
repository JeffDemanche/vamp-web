import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import { ContextMenuContext } from "./context-menu-context";
import * as styles from "./context-menu.less";

export interface ContextMenuOption {
  component: JSX.Element;
}

export interface ContextMenuProps {
  headerText?: string;
  screenPos: { x: number; y: number };
  target: React.MutableRefObject<unknown>;
  options: ContextMenuOption[];
}

/**
 * This is the actual component that gets rendered on context menu actions.
 */
export const ContextMenu = ({
  headerText,
  screenPos,
  target,
  options
}: ContextMenuProps): JSX.Element => {
  return (
    <div
      onClick={(e: React.MouseEvent): void => {
        e.stopPropagation();
      }}
      style={{ left: `${screenPos.x}px`, top: `${screenPos.y}px` }}
      className={styles["menu-container"]}
    >
      <div className={styles["context-menu"]}>
        {headerText && <div className={styles["menu-title"]}>{headerText}</div>}
        {options.map((option, i) => (
          <span className={styles["menu-item"]} key={i}>
            {option.component}
          </span>
        ))}
      </div>
    </div>
  );
};

interface UseContextMenuArgs<T extends HTMLElement> {
  headerText?: string;
  target: React.MutableRefObject<T>;
  options: ContextMenuOption[];
  onContextMenuOpened?: () => void;
  onContextMenuClosed?: () => void;
}

interface UseContextMenuReturn {
  isOpen: boolean;
}

/**
 * Components that we attach context menus to call this hook to handle setting
 * up and rendering context menus.
 */
export const useContextMenu = <T extends HTMLElement>({
  headerText,
  target,
  options,
  onContextMenuOpened,
  onContextMenuClosed
}: UseContextMenuArgs<T>): UseContextMenuReturn => {
  const { setContextMenu } = useContext(ContextMenuContext);

  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setIsOpen(false);
    onContextMenuClosed();
  }, [onContextMenuClosed]);

  useEffect(() => {
    const listener = (e: MouseEvent): void => {
      e.preventDefault();
      setIsOpen(true);
      setContextMenu(
        { headerText, options, target },
        { x: e.clientX, y: e.clientY },
        onClose
      );
      onContextMenuOpened();
    };
    const element = target.current;

    element.addEventListener("contextmenu", listener);

    return (): void => {
      console.log("useeffect cleanup");
      element.removeEventListener("contextmenu", listener);
    };
  }, []);

  return { isOpen };
};
