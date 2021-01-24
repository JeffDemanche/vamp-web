import * as React from "react";
import { useCallback, useState } from "react";

export interface DropZone<Metadata = void> {
  id: string;
  class: "Track" | "Cab";
  ref: React.MutableRefObject<HTMLDivElement>;
  metadata?: Metadata;
}

export const DropZonesContext = React.createContext<{
  dropZones: DropZone[];
  registerDropZone: <T>(dropZone: DropZone<T>) => void;
  setTrackDropZones: (dropZones: DropZone<{ index: number }>[]) => void;
  removeDropZone: (id: string) => void;
}>(null);

interface DropZonesProviderProps {
  children: JSX.Element | JSX.Element[];
}

/**
 * Wraps the workspace. Provides a React context that can be used throughout the
 * workspace DOM to interact with DOM elements where draggable components can be
 * dropped. For instance, tracks get registered when they're mounted, then
 * they're stored in the context so clips can access them as refs for use when
 * dragging clips around.
 */
export const DropZonesProvider: React.FC<DropZonesProviderProps> = ({
  children
}: DropZonesProviderProps) => {
  const [dropZones, setDropZones] = useState<DropZone<any>[]>([]);

  const registerDropZone = useCallback(
    <T,>(dropZone: DropZone<T>): void => {
      const newDropZones = [...dropZones, dropZone];
      setDropZones(newDropZones);
    },
    [dropZones]
  );

  const setTrackDropZones = (
    dropZones: DropZone<{ index: number }>[]
  ): void => {
    const newDropZones = dropZones.filter(zone => zone.class !== "Track");
    setDropZones(newDropZones.concat(dropZones));
  };

  const removeDropZone = (id: string): void => {
    const newDropZones = dropZones.filter(zone => zone.id !== id);
    setDropZones(newDropZones);
  };

  return (
    <DropZonesContext.Provider
      value={{ dropZones, registerDropZone, setTrackDropZones, removeDropZone }}
    >
      {children}
    </DropZonesContext.Provider>
  );
};
