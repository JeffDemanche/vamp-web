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
      data-test-id="context-menu-div"
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

  /**
   * Setting this as false disables opening the menu on the "contextmenu" DOM
   * event.
   */
  disableContextMenuEvent?: boolean;
  target: React.MutableRefObject<T>;
  options: ContextMenuOption[];
  onContextMenuOpened?: () => void;
  onContextMenuClosed?: () => void;
}

interface UseContextMenuReturn {
  isOpen: boolean;
  openMenu: (pos: { x: number; y: number }) => void;
  closeMenu: () => void;
}

/**
 * Components that we attach context menus to call this hook to handle setting
 * up and rendering context menus.
 */
export const useContextMenu = <T extends HTMLElement>({
  headerText,
  disableContextMenuEvent,
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

  const openMenu = useCallback(
    (pos: { x: number; y: number }): void => {
      setIsOpen(true);
      setContextMenu({
        props: { headerText, options, target },
        pos,
        closeListener: onClose
      });
      onContextMenuOpened();
    },
    [headerText, onClose, onContextMenuOpened, options, setContextMenu, target]
  );

  const closeMenu = useCallback((): void => {
    setContextMenu(undefined);
  }, [setContextMenu]);

  useEffect(() => {
    const listener = (e: MouseEvent): void => {
      e.preventDefault();
      openMenu({ x: e.clientX, y: e.clientY });
    };
    const element = target.current;

    if (!disableContextMenuEvent) {
      element.addEventListener("contextmenu", listener);
    }

    return (): void => {
      if (!disableContextMenuEvent) {
        element.removeEventListener("contextmenu", listener);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isOpen, openMenu, closeMenu };
};
