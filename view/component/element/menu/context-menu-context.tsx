import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { ContextMenu, ContextMenuProps } from "./context-menu";

interface ContextMenuContextValue {
  setContextMenu: (
    props: Omit<ContextMenuProps, "screenPos">,
    pos: { x: number; y: number },
    onClose: () => void
  ) => void;
}

const defaultContextMenuContext = {
  setContextMenu: (): void => {}
};

export const ContextMenuContext = React.createContext<ContextMenuContextValue>(
  defaultContextMenuContext
);

interface ContextMenuProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children
}: ContextMenuProviderProps) => {
  const [contextMenuProps, setContextMenuProps] = useState<
    Omit<ContextMenuProps, "screenPos">
  >(undefined);

  const [pos, setPos] = useState<{ x: number; y: number }>(undefined);

  const [closeListener, setCloseListener] = useState<() => void>(undefined);

  const contextMenu = useMemo(() => {
    if (pos !== undefined && contextMenuProps !== undefined)
      return <ContextMenu {...contextMenuProps} screenPos={pos}></ContextMenu>;
    return <div />;
  }, [contextMenuProps, pos]);

  const setContextMenu = useCallback(
    (
      props: ContextMenuProps,
      pos: { x: number; y: number },
      onClose: () => void
    ): void => {
      setPos(pos);
      setContextMenuProps(props);
      // Reminder if you set state to a function do it this way.
      setCloseListener(() => onClose);
    },
    []
  );

  const value: ContextMenuContextValue = { setContextMenu };

  return (
    <ContextMenuContext.Provider value={value}>
      <div
        onClick={(): void => {
          closeListener?.();
          setContextMenu(undefined, undefined, undefined);
        }}
        style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexFlow: "column"
        }}
      >
        {contextMenu}
        {children}
      </div>
    </ContextMenuContext.Provider>
  );
};
