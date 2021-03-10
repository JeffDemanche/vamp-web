import { useEffect } from "react";
import { audioStore } from "./audio-store";
import { SchedulerInstance, SchedulerEvent } from "./scheduler";
import { usePrevious } from "../util/react-hooks";
import _ = require("underscore");
import { useRemoveClientClip } from "../state/client-clip-state-hooks";

type Scheduler = typeof SchedulerInstance;

interface Clip {
  id: string;
  start: number;
  duration: number;
  audio: {
    id: string;
    latencyCompensation: number;
    storedLocally: boolean;
  };
}

interface ClientClip {
  start: number;
  audioStoreKey: string;
  realClipId: string;
  inProgress: boolean;
  latencyCompensation: number;
}

interface ClipPlayerProps {
  clips: Clip[];
  clientClips: ClientClip[];
  audioStore: typeof audioStore;
  scheduler: Scheduler;
}

const createClipEvent = (
  id: string,
  start: number,
  storeKey: string
): SchedulerEvent => {
  return {
    id,
    start,
    type: "Clip",
    dispatch: async (
      context: AudioContext,
      ctxStart: number,
      offset: number
    ): Promise<AudioScheduledSourceNode> => {
      const fileBuffer = await audioStore
        .getStoredAudio(storeKey)
        .data.arrayBuffer();
      const source = context.createBufferSource();

      const decodedData = await context.decodeAudioData(fileBuffer);

      source.buffer = decodedData;
      source.connect(context.destination);

      const contextDiff = context.currentTime - ctxStart;

      // The WAA start function takes different params for delaying the
      // start of a node (when) and playing the node from a point other
      // than the start (offset).
      const when = offset < 0 ? -offset : 0;
      const offsetVal = offset > 0 ? offset : 0;

      source.start(ctxStart + when, offsetVal + contextDiff);

      return source;
    }
  };
};

/**
 * Called for every clip addition in cache.
 */
const onClipAdded = (clip: Clip, scheduler: Scheduler): void => {
  if (clip.audio.storedLocally) {
    scheduler.addEvent(createClipEvent(clip.id, clip.start, clip.audio.id));
  }
};

/**
 * Called for every client clip addition in cache.
 */
const onClientClipAdded = (
  clientClip: ClientClip,
  scheduler: Scheduler
): void => {
  // TODO we could do some stuff here.
};

/**
 * Called for every clip removal from cache.
 */
const onClipRemoved = (clip: Clip, scheduler: Scheduler): void => {
  scheduler.removeEvent(clip.id);
};

/**
 * Called for every client clip removal from cache.
 */
const onClientClipRemoved = (
  clientClip: ClientClip,
  scheduler: Scheduler
): void => {
  scheduler.removeEvent(clientClip.audioStoreKey);
};

/**
 * Called when a clip from cache doesn't deep equal the previous clip with the
 * same ID. Checking which properties changed is left up to the implementation.
 */
const onClipChanged = (
  prevClip: Clip,
  clip: Clip,
  scheduler: Scheduler,
  clientClips: ClientClip[],
  removeClientClip: (audioStoreKey: string) => boolean
): void => {
  if (!prevClip.audio.storedLocally && clip.audio.storedLocally) {
    // Clip audio was just downloaded.
    scheduler.addEvent(
      createClipEvent(
        clip.id,
        clip.start - clip.audio.latencyCompensation,
        clip.audio.id
      )
    );

    // The following deals with the case when this clip takes over from a client
    // clip.
    const clientClip = _.findWhere(clientClips, { realClipId: clip.id });
    if (clientClip) {
      removeClientClip(clientClip.audioStoreKey);
    }
  }
  if (prevClip.start !== clip.start) {
    scheduler.updateEvent(clip.id, { start: clip.start });
  }
};

/**
 * Called when a client clip from cache doesn't deep equal the previous client
 * clip with the same ID.
 */
const onClientClipChanged = (
  prevClientClip: ClientClip,
  clientClip: ClientClip,
  scheduler: Scheduler
): void => {
  if (prevClientClip.inProgress && !clientClip.inProgress) {
    scheduler.addEvent(
      createClipEvent(
        clientClip.audioStoreKey,
        clientClip.start - clientClip.latencyCompensation,
        clientClip.audioStoreKey
      )
    );
  }
};

/**
 * This is a component that's used in the WorkspaceAudio component. This is
 * responsible for tracking clips in the Apollo cache and managing their
 * scheduled audio events.
 */
const ClipPlayer = ({
  clips,
  clientClips,
  audioStore,
  scheduler
}: ClipPlayerProps): JSX.Element => {
  const prev = usePrevious({ clips, clientClips });

  const removeClientClip = useRemoveClientClip();

  // This call creates audio scheduler events for clips that have been retrieved
  // from the server via query or subscription.
  useEffect(() => {
    if (prev) {
      // HANDLE CLIPS/CLIENT CLIPS BEING REMOVED.
      const clipIds: Set<string> = new Set(clips.map(clip => clip.id));
      prev.clips.forEach(prevClip => {
        if (!clipIds.has(prevClip.id)) {
          // prevClip got removed.
          onClipRemoved(prevClip, scheduler);
        }
      });

      const clientClipIds: Set<string> = new Set(
        clientClips.map(clientClip => clientClip.audioStoreKey)
      );
      prev.clientClips.forEach(prevClientClip => {
        if (!clientClipIds.has(prevClientClip.audioStoreKey)) {
          // prevClientClip got removed.
          onClientClipRemoved(prevClientClip, scheduler);
        }
      });

      // HANDLE CLIPS/CLIENT CLIPS BEING ADDED.
      const prevClipIds: Set<string> = new Set(prev.clips.map(clip => clip.id));
      clips.forEach(clip => {
        if (!prevClipIds.has(clip.id)) {
          // clip got added.
          onClipAdded(clip, scheduler);
        }
      });

      const prevClientClipIds: Set<string> = new Set(
        prev.clientClips.map(clientClip => clientClip.audioStoreKey)
      );
      clientClips.forEach(clientClip => {
        if (!prevClientClipIds.has(clientClip.audioStoreKey)) {
          // clientClip got added.
          onClientClipAdded(clientClip, scheduler);
        }
      });

      // HANDLE CLIPS/CLIENT CLIPS BEING CHANGED.
      clips.forEach(clip => {
        const prevClip = _.findWhere(prev.clips, { id: clip.id });
        if (clip && prevClip) {
          if (!_.isEqual(clip, prevClip)) {
            onClipChanged(
              prevClip,
              clip,
              scheduler,
              clientClips,
              removeClientClip
            );
          }
        }
      });

      clientClips.forEach(clientClip => {
        const prevClientClip = _.findWhere(prev.clientClips, {
          audioStoreKey: clientClip.audioStoreKey
        });
        if (clientClip && prevClientClip) {
          if (!_.isEqual(clientClip, prevClientClip)) {
            onClientClipChanged(prevClientClip, clientClip, scheduler);
          }
        }
      });
    } else {
      // Do this on the first update (when there's no prev to compare to).
      clips.forEach(clip => {
        onClipAdded(clip, scheduler);
      });
      clientClips.forEach(clientClip => {
        onClientClipAdded(clientClip, scheduler);
      });
    }
  }, [clips, clientClips]);

  return null;
};

export default ClipPlayer;
