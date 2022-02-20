import * as React from "react";
import { useCallback, useState } from "react";

interface SelectionContextData {
  selectedClipIds: string[];
  selectClip: (id: string) => void;
  deselectClip: (id: string) => void;
  setSelectedClips: (ids: string[]) => void;
}

export const defaultSelectionContextValue: SelectionContextData = {
  selectedClipIds: [],
  selectClip: () => {},
  deselectClip: () => {},
  setSelectedClips: () => {}
};

export const SelectionContext = React.createContext(
  defaultSelectionContextValue
);

export const SelectionProvider: React.FC<{ children: JSX.Element }> = ({
  children
}: {
  children: JSX.Element;
}) => {
  const [selectedClipIds, setSelectedClipIds] = useState([]);

  const selectClip = useCallback(
    (id: string) => {
      console.log(id);
      setSelectedClipIds([...selectedClipIds, id]);
    },
    [selectedClipIds]
  );

  const deselectClip = useCallback(
    (id: string) => {
      setSelectedClipIds(selectedClipIds.filter(clipId => id !== clipId));
    },
    [selectedClipIds]
  );

  const setSelectedClips = useCallback((ids: string[]) => {
    setSelectedClipIds(ids);
  }, []);

  return (
    <SelectionContext.Provider
      value={{ selectedClipIds, selectClip, deselectClip, setSelectedClips }}
    >
      {children}
    </SelectionContext.Provider>
  );
};
