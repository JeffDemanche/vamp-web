import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { usePrevious } from "../../../util/react-hooks";
import { ContextMenu, ContextMenuProps } from "./context-menu";

interface ContextMenuContextValue {
  setContextMenu: (contextMenuInfo: ContextMenuInfo) => void;
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

interface ContextMenuInfo {
  props: Omit<ContextMenuProps, "screenPos">;
  pos: { x: number; y: number };
  closeListener: () => void;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children
}: ContextMenuProviderProps) => {
  const [contextMenuInfo, setContextMenuInfo] = useState<
    ContextMenuInfo | undefined
  >(undefined);

  const previousContextMenuInfo = usePrevious(contextMenuInfo);

  useEffect(() => {
    if (contextMenuInfo && previousContextMenuInfo) {
      previousContextMenuInfo.closeListener?.();
    } else if (previousContextMenuInfo && !contextMenuInfo) {
      previousContextMenuInfo.closeListener?.();
    }
  }, [contextMenuInfo, previousContextMenuInfo]);

  const menuOpen = !!contextMenuInfo;

  const contextMenu = useMemo(() => {
    if (menuOpen)
      return (
        <ContextMenu
          {...contextMenuInfo.props}
          screenPos={contextMenuInfo.pos}
        ></ContextMenu>
      );
    return <div />;
  }, [contextMenuInfo?.pos, contextMenuInfo?.props, menuOpen]);

  const setContextMenu = (info: ContextMenuInfo): void => {
    setContextMenuInfo(info);
  };

  const value: ContextMenuContextValue = { setContextMenu };

  return (
    <ContextMenuContext.Provider value={value}>
      <div
        onClick={(): void => {
          console.log("outside click");
          setContextMenu(undefined);
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
