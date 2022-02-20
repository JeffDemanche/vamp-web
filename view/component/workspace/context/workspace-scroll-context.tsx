import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WorkspaceScrollContextQuery } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../util/react-hooks";
import { useWindowDimensions } from "../../../util/workspace-hooks";
import { MouseWheelAggregater, normalizeWheel } from "./scroll-helpers";
import * as styles from "./workspace-scroll-context.less";

const WORKSPACE_SCROLL_CONTEXT_QUERY = gql`
  query WorkspaceScrollContextQuery($vampId: ID!) {
    vamp(id: $vampId) @client {
      tracks {
        id
      }
    }
  }
`;

interface WorkspaceScrollContextData {
  temporalZoom: number;
  horizontalPos: number;
  tracksRef: (node: HTMLDivElement) => void;
}

export const defaultWorkspaceScrollContextValue: WorkspaceScrollContextData = {
  temporalZoom: 100,
  horizontalPos: 0,
  tracksRef: () => {}
};

export const WorkspaceScrollContext = React.createContext(
  defaultWorkspaceScrollContextValue
);

interface WorkspaceScrollProviderProps {
  children: JSX.Element[];
}

export const WorkspaceScrollProvider: React.FC<WorkspaceScrollProviderProps> = ({
  children
}: WorkspaceScrollProviderProps) => {
  const vampId = useCurrentVampId();

  const {
    data: {
      vamp: { tracks }
    }
  } = useQuery<WorkspaceScrollContextQuery>(WORKSPACE_SCROLL_CONTEXT_QUERY, {
    variables: { vampId }
  });

  const { width: windowWidth } = useWindowDimensions();

  const OFFSET_DEC = 0.4;
  const [horizontalPosOffset, setHoriztontalPosOffset] = useState<number>(
    windowWidth * OFFSET_DEC
  );

  useEffect(() => {
    setHoriztontalPosOffset(windowWidth * OFFSET_DEC);
  }, [windowWidth]);

  const [temporalZoom, setTemporalZoom] = useState<number>(1.0);
  // Between 0 and the number of tracks - 1
  const [verticalPos, setVerticalPos] = useState<number>(0.0);
  const [horizontalPos, setHorizontalPos] = useState<number>(0.0);

  const mouseWheelAggregator = useMemo(
    () =>
      new MouseWheelAggregater((deltaY, e) => {
        if (!e.altKey && !e.shiftKey) {
          const clampedPos = Math.max(
            0,
            Math.min(tracks.length - 1, verticalPos + deltaY / 200.0)
          );
          setVerticalPos(clampedPos);
        }
      }, 10),
    [tracks.length, verticalPos]
  );

  const onEveryWheel = useCallback(
    (e: React.WheelEvent) => {
      e.persist();
      const { pixelY } = normalizeWheel(e);

      mouseWheelAggregator.onWheel(e);

      if (e.altKey) {
        const mouseX = e.clientX;
        // Mouse position relative to 0 seconds.
        const mouseOffset = mouseX - (horizontalPos + horizontalPosOffset);
        const zoomMultiplier = 1 - 0.001 * pixelY;
        setTemporalZoom(temporalZoom * zoomMultiplier);
        if (pixelY < 0) {
          setHorizontalPos(horizontalPos - mouseOffset * 0.1);
        } else {
          setHorizontalPos(horizontalPos + mouseOffset * 0.1);
        }
      } else if (e.shiftKey) {
        setHorizontalPos(horizontalPos + pixelY * 0.75);
      }
    },
    [horizontalPos, horizontalPosOffset, mouseWheelAggregator, temporalZoom]
  );

  /**
   * Ideally we don't want scrolling to trigger any component re-renders.
   * Instead, we hold ref objects for every component that changes style on
   * scroll events. This callback function in particular will fire first when
   * the tracks container ref component gets loaded, and then whenever
   * verticalPos changes (i.e. on scroll). We *could* just use a normal useRef,
   * but there'd be no way to set that initially, since WorkspaceComponent gets
   * rendered before the ref objects do.
   */
  const tracksRef = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null && node.children.length > 0) {
        // Determines the decimal height of clips when they don't need to enable
        // scrolling.
        const clipHeightNoScroll = 0.3;

        const numTracks = tracks.length;

        if (verticalPos < 0) {
          setVerticalPos(0);
        } else if (verticalPos >= numTracks) {
          setVerticalPos(Math.max(numTracks - 1, 0));
        }

        const focusedTrack = Math.round(verticalPos);

        const rawWeights: number[] = [];
        for (let i = 0; i < numTracks; i++) {
          const indexDist = Math.abs(focusedTrack - i);
          // The exponent here determines "vertical zoom." Higher values are
          // more exaggerated.
          rawWeights.push(1.0 / Math.pow(indexDist + 1, 0.6));
        }

        const sum =
          rawWeights.length > 0
            ? rawWeights.reduce((acc, cur) => acc + cur)
            : 0;

        const gridTemplateRows = tracks
          .map((track, i) => {
            if (clipHeightNoScroll * numTracks <= 1.0) {
              return `${clipHeightNoScroll * 100}%`;
            } else {
              const clampedHeight = rawWeights[i] / sum;
              return `${clampedHeight * 100}%`;
            }
          })
          .join(" ");
        node.style.gridTemplateRows = gridTemplateRows;
      }
      //setTrackRefTrigger(false);
    },
    [verticalPos, tracks]
  );

  /**
   * The point here is to listen to changes to tracks and then trigger the
   * callback function below on *the next* update, adjusting the track heights.
   * If we just listened to this straight on the callback function, the tracks
   * component won't have been updated yet.
   */
  useEffect(() => {
    //setTrackRefTrigger(true);
  }, [tracks]);

  return (
    <WorkspaceScrollContext.Provider
      value={{
        temporalZoom,
        horizontalPos: horizontalPos + horizontalPosOffset,
        tracksRef
      }}
    >
      <div
        className={styles["workspace-scroll-wrapper"]}
        onWheel={onEveryWheel}
      >
        {children}
      </div>
    </WorkspaceScrollContext.Provider>
  );
};
