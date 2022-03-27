import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import { ContextMenuContext } from "./context-menu-context";
import * as styles from "./context-menu.less";

export interface ContextMenuOption {
  component: JSX.Element;
}

export interface ContextMenuScreenProps {
  pushScreen: (id: number) => void;
}

export interface ContextMenuScreen<TScreenProps extends object> {
  id: number;
  title: string;
  Component: (props: ContextMenuScreenProps & TScreenProps) => JSX.Element;
  componentProps?: TScreenProps;
}

export interface ContextMenuProps {
  screenPos: { x: number; y: number };
  target: React.MutableRefObject<unknown>;
  screens: ContextMenuScreen<object>[];
  initialScreen: number;
}

/**
 * This is the actual component that gets rendered on context menu actions.
 */
export const ContextMenu = ({
  screenPos,
  target,
  screens,
  initialScreen
}: ContextMenuProps): JSX.Element => {
  const [screenIdStack, setScreenIdStack] = useState<number[]>([
    screens.find(s => s.id === initialScreen)?.id
  ]);

  if (screenIdStack[0] === undefined)
    throw new Error("Tried to render context menu screen that didn't exist");

  const pushScreen = useCallback(
    (id: number) => {
      const newScreen = screens.find(s => s.id === id);
      if (newScreen === undefined) {
        throw new Error("Tried to push context menu screen that didn't exist");
      }
      setScreenIdStack([id, ...screenIdStack]);
    },
    [screenIdStack, screens]
  );

  const goBack = useCallback(() => {
    const shifted = [...screenIdStack];
    shifted.shift();
    setScreenIdStack(shifted);
  }, [screenIdStack]);

  const renderBackButton = screenIdStack.length > 1;

  const CurrentScreen = screens.find(s => s.id === screenIdStack[0]);

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
        <div className={styles["menu-title"]}>
          {renderBackButton && (
            <span onClick={goBack} className={styles["back-button"]}>
              {"<"}
            </span>
          )}
          {CurrentScreen.title && (
            <span className={styles["header-text"]}>{CurrentScreen.title}</span>
          )}
        </div>
        <CurrentScreen.Component
          pushScreen={pushScreen}
          {...CurrentScreen.componentProps}
        ></CurrentScreen.Component>
      </div>
    </div>
  );
};

interface UseContextMenuArgs<T extends HTMLElement> {
  /**
   * Setting this as false disables opening the menu on the "contextmenu" DOM
   * event.
   */
  disableContextMenuEvent?: boolean;

  /** Will default to cursor location. */
  pos?: { x: number; y: number };
  target: React.MutableRefObject<T>;

  screens: ContextMenuScreen<object>[];
  initialScreen: number;

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
  disableContextMenuEvent,
  pos,
  target,
  screens,
  initialScreen,
  onContextMenuOpened,
  onContextMenuClosed
}: UseContextMenuArgs<T>): UseContextMenuReturn => {
  const { setContextMenu } = useContext(ContextMenuContext);

  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setIsOpen(false);
    onContextMenuClosed?.();
  }, [onContextMenuClosed]);

  const openMenu = useCallback(
    (pos: { x: number; y: number }): void => {
      setIsOpen(true);
      onContextMenuOpened?.();
      setContextMenu({
        props: { screens, initialScreen, target },
        pos,
        closeListener: onClose
      });
    },
    [
      initialScreen,
      onClose,
      onContextMenuOpened,
      screens,
      setContextMenu,
      target
    ]
  );

  const closeMenu = useCallback((): void => {
    setContextMenu(undefined);
  }, [setContextMenu]);

  useEffect(() => {
    const listener = (e: MouseEvent): void => {
      e.preventDefault();
      const menuPos = pos ?? { x: e.clientX, y: e.clientY };
      openMenu(menuPos);
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
  }, [pos]);

  return { isOpen, openMenu, closeMenu };
};
