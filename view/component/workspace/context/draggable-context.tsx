import * as React from "react";
import { createContext, useCallback, useEffect, useState } from "react";
import _ from "underscore";

interface Draggable {
  id: string;
  mouseUpListener?: (ev: MouseEvent) => void;
  mouseMoveListener?: (ev: MouseEvent) => void;
}

export interface TrackDropzone {
  id: string;
  type: "Track";
  ref: React.MutableRefObject<HTMLDivElement>;
  trackIndex: number;
}

export type Dropzone = TrackDropzone;

interface DraggableContextData {
  /**
   * Registers a draggable object to the context, which can recieve events, etc.
   * This should be placed in a useEffect with a cleanup call to removeDraggable
   * and neither function should be a dependency.
   */
  registerDraggable: (params: Draggable) => void;
  removeDraggable: (id: string) => void;

  /**
   * Registers a dropzone. When a draggable is dragged, it can access all the
   * registered dropzones that it is currently over.
   */
  registerDropzones: (dropzones: Dropzone[]) => void;
  removeDropzone: (id: string) => void;

  getHoveredDropzones: (screenPos: number[], types: string[]) => Dropzone[];
}

export const DraggableContext = createContext<DraggableContextData>({
  registerDraggable: () => {},
  removeDraggable: () => {},
  registerDropzones: () => [],
  removeDropzone: () => {},
  getHoveredDropzones: () => []
});

interface DraggableProviderProps {
  children: React.ReactChild | React.ReactChildren;
}

const insideRect = (rect: DOMRect, pointX: number, pointY: number): boolean => {
  const xIn = pointX >= rect.x && pointX <= rect.x + rect.width;
  const yIn = pointY >= rect.y && pointY <= rect.y + rect.height;
  return xIn && yIn;
};

/**
 * Wraps the whole workspace (found in WorkspaceContent component). Handles
 * global functionality for dragging stuff around in the workspace.
 */
export const DraggableProvider: React.FC<DraggableProviderProps> = ({
  children
}: DraggableProviderProps) => {
  // DRAGGABLES
  // Stores a map of names to draggable objects. Remember not to mutate.
  const [draggables, setDraggables] = useState<{ [id: string]: Draggable }>({});

  const registerDraggable = useCallback(
    (params: Draggable): void => {
      setDraggables({ ...draggables, [params.id]: params });
    },
    [draggables]
  );

  const removeDraggable = useCallback(
    (id: string): void => {
      const draggablesCopy = { ...draggables };
      if (draggablesCopy[id] !== undefined) delete draggablesCopy[id];
      setDraggables(draggablesCopy);
    },
    [draggables]
  );

  const onWindowMouseMove = useCallback(
    (ev: MouseEvent): void => {
      Object.entries(draggables).forEach(draggable => {
        draggable[1].mouseMoveListener && draggable[1].mouseMoveListener(ev);
      });
    },
    [draggables]
  );

  const onWindowMouseUp = useCallback(
    (ev: MouseEvent): void => {
      Object.entries(draggables).forEach(draggable => {
        draggable[1].mouseUpListener && draggable[1].mouseUpListener(ev);
      });
    },
    [draggables]
  );

  // This will re-initialize the listeners every time the dependencies change.
  useEffect(() => {
    const onWindowMouseMoveDebounced = _.throttle(onWindowMouseMove, 2);

    window.addEventListener("mousemove", onWindowMouseMoveDebounced);
    window.addEventListener("mouseup", onWindowMouseUp);

    return (): void => {
      window.removeEventListener("mousemove", onWindowMouseMoveDebounced);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [onWindowMouseMove, onWindowMouseUp]);

  // DROPZONES
  const [dropzones, setDropzones] = useState<{ [id: string]: Dropzone }>({});

  const registerDropzones = useCallback(
    (dzs: Dropzone[]) => {
      const dzsMap: { [id: string]: Dropzone } = {};
      dzs.forEach(dz => (dzsMap[dz.id] = dz));
      setDropzones({ ...dropzones, ...dzsMap });
    },
    [dropzones]
  );

  const removeDropzone = useCallback(
    (id: string) => {
      const dropzonesCopy = { ...dropzones };
      if (dropzonesCopy[id] !== undefined) delete dropzonesCopy[id];
      setDropzones(dropzonesCopy);
    },
    [dropzones]
  );

  const getHoveredDropzones = useCallback(
    ([x, y]: number[], types: string[]) => {
      const hoveredZones: Dropzone[] = [];
      Object.entries(dropzones).forEach(entry => {
        const zone = entry[1];
        if (types.includes(zone.type)) {
          const zoneRect = zone.ref.current.getBoundingClientRect();
          if (insideRect(zoneRect, x, y)) {
            hoveredZones.push(zone);
          }
        }
      });
      return hoveredZones;
    },
    [dropzones]
  );

  return (
    <DraggableContext.Provider
      value={{
        registerDraggable,
        removeDraggable,
        registerDropzones,
        removeDropzone,
        getHoveredDropzones
      }}
    >
      {children}
    </DraggableContext.Provider>
  );
};
