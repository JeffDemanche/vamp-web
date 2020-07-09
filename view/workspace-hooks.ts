import { useQuery } from "react-apollo";
import {
  TEMPORAL_ZOOM_CLIENT,
  METRONOME_INFO_CLIENT
} from "./state/queries/vamp-queries";
import {
  ViewBoundsDataClient,
  TemporalZoomClient,
  MetronomeClient
} from "./state/apollotypes";
import { useCurrentVampId, useCurrentUserId } from "./react-hooks";
import { useState, useEffect } from "react";
import { gql } from "apollo-boost";

/**
 * Returns a function that will determine width for a duration, which should be
 * in seconds. The hook itself should be called once, at the beginning of a
 * component function definition.
 */
export const useWorkspaceWidth = (): ((duration: number) => number) => {
  const vampId = useCurrentVampId();

  const { data } = useQuery<TemporalZoomClient>(TEMPORAL_ZOOM_CLIENT, {
    variables: { vampId }
  });

  if (!data) return (): number => 0;

  const width = (duration: number): number =>
    100 * duration * data.vamp.viewState.temporalZoom;
  return width;
};

/**
 * Like the opposite of useWorkspaceWidth. Returns a function that, given the
 * pixel-width of a workspace object, gives the duration in seconds.
 */
export const useWorkpaceDuration = (): ((width: number) => number) => {
  const vampId = useCurrentVampId();

  const { data } = useQuery<TemporalZoomClient>(TEMPORAL_ZOOM_CLIENT, {
    variables: { vampId }
  });

  if (!data) return (): number => 0;

  const duration = (width: number): number =>
    width / (100 * data.vamp.viewState.temporalZoom);
  return duration;
};

/**
 * Returns a function that will determine the left-relative position for CSS of
 * a time in the workspace. As with useWorkspaceWidth, call this hook once at
 * the start of a component function and then call the resulting function
 * whenever you want.
 */
export const useWorkspaceLeft = (): ((time: number) => number) => {
  const vampId = useCurrentVampId();

  const { data } = useQuery<TemporalZoomClient>(TEMPORAL_ZOOM_CLIENT, {
    variables: { vampId }
  });

  if (!data) return (): number => 0;

  const left = (time: number): number =>
    100 * time * data.vamp.viewState.temporalZoom;
  return left;
};

/**
 * Opposite of useWorkspaceLeft. Returns a function that converts left
 * pixel-position into the time position in seconds.
 */
export const useWorkspaceTime = (): ((left: number) => number) => {
  const vampId = useCurrentVampId();

  const { data } = useQuery<TemporalZoomClient>(TEMPORAL_ZOOM_CLIENT, {
    variables: { vampId }
  });

  if (!data) return (): number => 0;

  const time = (left: number): number =>
    left / (100 * data.vamp.viewState.temporalZoom);
  return time;
};

/**
 * Hooks into the width and height of the window.
 */
export const useWindowDimensions = (): { width: number; height: number } => {
  const getDims = (): { width: number; height: number } => ({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [windowDimensions, setWindowDimensions] = useState(getDims());

  useEffect(() => {
    const resize = (): void => {
      setWindowDimensions(getDims());
    };

    window.addEventListener("resize", resize);
    return (): void => window.removeEventListener("resize", resize);
  });

  return windowDimensions;
};

/**
 * Updates with the start and end view bounds. Those are the beginning and
 * ending time positions for all elements of a Vamp that would need to be in
 * view (Clips, Cab, ClientClips, potentially more).
 */
export const useViewBounds = (): { start: number; end: number } => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const [start, setStart] = useState(Number.POSITIVE_INFINITY);
  const [end, setEnd] = useState(Number.NEGATIVE_INFINITY);

  const { data, loading } = useQuery<ViewBoundsDataClient>(
    gql`
      query ViewBoundsDataClient($vampId: ID!, $userId: ID!) {
        vamp(id: $vampId) @client {
          id @client
          clips @client {
            id @client
            start @client
            audio @client {
              id @client
              duration @client
            }
          }
          clientClips @client {
            id @client
            start @client
            duration @client
          }
        }
        userInVamp(vampId: $vampId, userId: $userId) @client {
          id @client
          cab @client {
            start @client
            duration @client
          }
        }
      }
    `,
    { variables: { vampId, userId } }
  );

  useEffect(() => {
    if (loading || !data) {
      setStart(0);
      setEnd(0);
      return;
    }

    let start = Number.POSITIVE_INFINITY;
    let end = Number.NEGATIVE_INFINITY;

    const {
      vamp: { clips, clientClips },
      userInVamp: { cab }
    } = data;

    clips.forEach(clip => {
      if (clip.start < start) start = clip.start;
      const clipEnd = clip.audio.duration + clip.start;
      if (clipEnd > end) end = clipEnd;
    });
    clientClips.forEach(clientClip => {
      if (clientClip.start < start) start = clientClip.start;
      const ccEnd = clientClip.duration + clientClip.start;
      if (ccEnd > end) end = ccEnd;
    });

    if (cab.start < start) start = cab.start;
    if (cab.duration + cab.start > end) end = cab.duration + cab.start;

    if (start === Number.POSITIVE_INFINITY) start = 0;
    if (end === Number.NEGATIVE_INFINITY) end = 0;

    setStart(start);
    setEnd(end);
  }, [data]);

  return { start, end };
};

/**
 * Returns a function that takes in a time position and seconds and returns the
 * nearest beat to that time.
 *
 * TODO liable to change with more complex metronome implementation.
 */
export const useSnapToBeat = (): ((time: number) => number) => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: { bpm }
    }
  } = useQuery<MetronomeClient>(METRONOME_INFO_CLIENT, {
    variables: { vampId }
  });

  return (time: number): number => {
    // Converts time from "position in seconds" to "position in beats."
    const inBeats = time * (bpm / 60.0);
    const rounded = Math.round(inBeats);
    return rounded / (bpm / 60.0);
  };
};