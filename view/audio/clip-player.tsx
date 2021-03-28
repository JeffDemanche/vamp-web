import { useEffect } from "react";
import { audioStore } from "./audio-store";
import { SchedulerInstance, SchedulerEvent } from "./scheduler";
import { usePrevious } from "../util/react-hooks";
import * as _ from "underscore";
import { useRemoveClientClip } from "../state/client-clip-state-hooks";
import Clip from "../component/workspace/clip/clip";

type Scheduler = typeof SchedulerInstance;

interface Clip {
  id: string;
  start: number;
  duration: number;
  content: {
    id: string;
    type: string;
    start: number;
    duration: number;
    audio: {
      id: string;
      latencyCompensation: number;
      storedLocally: boolean;
    };
  }[];
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

const createContentEvent = ({
  id,
  start,
  duration,
  storeKey
}: {
  id: string;
  start: number;
  duration?: number;
  storeKey: string;
}): SchedulerEvent => {
  return {
    id,
    start,
    duration,
    type: "Audio",
    dispatch: async ({
      context,
      startTime,
      offset,
      duration
    }: {
      context: AudioContext;
      startTime: number;
      offset: number;
      duration: number;
    }): Promise<AudioScheduledSourceNode> => {
      const fileBuffer = await audioStore
        .getStoredAudio(storeKey)
        .data.arrayBuffer();
      const source = context.createBufferSource();

      const decodedData = await context.decodeAudioData(fileBuffer);

      source.buffer = decodedData;
      source.connect(context.destination);

      const contextDiff = context.currentTime - startTime;

      // The WAA start function takes different params for delaying the
      // start of a node (when) and playing the node from a point other
      // than the start (offset).
      const when = offset < 0 ? -offset : 0;
      const offsetVal = offset > 0 ? offset : 0;

      source.start(startTime + when, offsetVal + contextDiff, duration);

      return source;
    }
  };
};

/**
 * Calculates the real scheduler start time for a piece of clip content.
 */
const calcContentStart = (
  clip: Clip,
  clipContent: Clip["content"][number]
): number =>
  clip.start - clipContent.audio.latencyCompensation + clipContent.start;

/**
 * Calculates how long clip content should play for, respecting that it might
 * get cut off if the clip ends before it does.
 */
const calcContentDuration = (
  clip: Clip,
  clipContent: Clip["content"][number]
): number => Math.min(clipContent.duration, clip.duration - clipContent.start);

/**
 * Called for every clip addition in cache.
 */
const onClipAdded = (clip: Clip, scheduler: Scheduler): void => {
  clip.content.forEach(content => {
    if (content.type === "AUDIO") {
      if (content.audio.storedLocally) {
        scheduler.addEvent(
          createContentEvent({
            id: content.id,
            start: calcContentStart(clip, content),
            duration: calcContentDuration(clip, content),
            storeKey: content.audio.id
          })
        );
      }
    }
  });
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
  clip.content.forEach(content => {
    scheduler.removeEvent(content.id);
  });
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

const onClipContentAdded = (
  clip: Clip,
  clipContent: Clip["content"][number],
  scheduler: Scheduler
): void => {
  if (clipContent.audio.storedLocally) {
    scheduler.addEvent(
      createContentEvent({
        id: clipContent.id,
        start: calcContentStart(clip, clipContent),
        duration: calcContentDuration(clip, clipContent),
        storeKey: clipContent.audio.id
      })
    );
  }
};

const onClipContentChanged = (
  prevClip: Clip,
  clip: Clip,
  prevClipContent: Clip["content"][number],
  clipContent: Clip["content"][number],
  scheduler: Scheduler,
  clientClips: ClientClip[],
  removeClientClip: (audioStoreKey: string) => boolean
): void => {
  if (!prevClipContent.audio.storedLocally && clipContent.audio.storedLocally) {
    // Clip audio was just downloaded.
    scheduler.addEvent(
      createContentEvent({
        id: clipContent.id,
        start: calcContentStart(clip, clipContent),
        duration: calcContentDuration(clip, clipContent),
        storeKey: clipContent.audio.id
      })
    );

    // The following deals with the case when this clip takes over from a client
    // clip.
    const clientClip = _.findWhere(clientClips, { realClipId: clip.id });
    if (clientClip) {
      removeClientClip(clientClip.audioStoreKey);
    }
  }

  // Updates to content caused by updates to containing clip or by updates to
  // the content itself.
  const eventUpdate: Partial<{ start: number; duration: number }> = {};

  if (
    prevClip.start !== clip.start ||
    prevClipContent.start !== clipContent.start
  )
    eventUpdate.start = calcContentStart(clip, clipContent);

  if (
    prevClip.duration !== clip.duration ||
    prevClipContent.duration !== clipContent.duration
  )
    eventUpdate.duration = calcContentDuration(clip, clipContent);

  if (!_.isEmpty(eventUpdate)) {
    scheduler.updateEvent(clipContent.id, eventUpdate);
  }
};

const onClipContentRemoved = (
  prevClipContent: Clip["content"][number],
  scheduler: Scheduler
): void => {
  if (prevClipContent.type === "audio") {
    scheduler.removeEvent(prevClipContent.id);
  }
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
  // Transform content arrays into maps where their IDs are keys.
  const prevClipContentMap: {
    [contentId: string]: Clip["content"][number];
  } = {};
  const clipContentMap: { [contentId: string]: Clip["content"][number] } = {};

  prevClip.content.forEach(prevContent => {
    prevClipContentMap[prevContent.id] = prevContent;
  });

  clip.content.forEach(content => {
    clipContentMap[content.id] = content;
  });

  const existingContentIds = new Set<string>();

  Object.keys(prevClipContentMap).forEach(prevContentId => {
    if (!clipContentMap[prevContentId]) {
      onClipContentRemoved(prevClipContentMap[prevContentId], scheduler);
    } else {
      existingContentIds.add(prevContentId);
    }
  });

  Object.keys(clipContentMap).forEach(contentId => {
    if (!prevClipContentMap[contentId]) {
      onClipContentAdded(clip, clipContentMap[contentId], scheduler);
    } else {
      existingContentIds.add(contentId);
    }
  });

  // This is a boolean value that's true if any of the props in the string array
  // have changed on the clip since last update.
  const updateContentFromClipChange = (["start", "duration"] as Array<
    keyof Clip
  >).reduce<boolean>(
    (prev, curr) => prev || clip[curr] !== prevClip[curr],
    false
  );

  // Individual content elements changed.
  Array.from(existingContentIds).forEach(existingId => {
    if (
      updateContentFromClipChange ||
      !_.isEqual(prevClipContentMap[existingId], clipContentMap[existingId])
    ) {
      onClipContentChanged(
        prevClip,
        clip,
        prevClipContentMap[existingId],
        clipContentMap[existingId],
        scheduler,
        clientClips,
        removeClientClip
      );
    }
  });
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
      createContentEvent({
        id: clientClip.audioStoreKey,
        start: clientClip.start - clientClip.latencyCompensation,
        storeKey: clientClip.audioStoreKey
      })
    );
  }
};

/**
 * This is a component that's used in the WorkspaceAudio component. This is
 * responsible for tracking clips in the Apollo cache and managing their
 * scheduled audio events. For instance, if we add a new clip, we immediately
 * want to update the scheduler to play that clip's content at the right time.
 * Same thing when we update or remove a clip.
 */
export const ClipPlayer = ({
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
  }, [clips, clientClips, prev, scheduler, removeClientClip]);

  return null;
};
