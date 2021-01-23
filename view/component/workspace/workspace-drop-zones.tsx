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
  registerOrUpdateDropZone: <T>(dropZone: DropZone<T>) => void;
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

  const registerOrUpdateDropZone = useCallback(
    <T,>(dropZone: DropZone<T>): void => {
      const dropZoneIds = new Set(dropZones.map(zone => zone.id));
      if (dropZoneIds.has(dropZone.id)) {
        const foundIndex = dropZones.findIndex(zone => zone.id === dropZone.id);
        dropZones[foundIndex] = dropZone;
        setDropZones(dropZones);
      } else {
        dropZones.push(dropZone);
        setDropZones(dropZones);
      }
    },
    [dropZones]
  );

  const removeDropZone = useCallback(
    (id: string) => {
      setDropZones(dropZones.filter(zone => zone.id !== id));
    },
    [dropZones]
  );

  return (
    <DropZonesContext.Provider
      value={{ dropZones, registerOrUpdateDropZone, removeDropZone }}
    >
      {children}
    </DropZonesContext.Provider>
  );
};
