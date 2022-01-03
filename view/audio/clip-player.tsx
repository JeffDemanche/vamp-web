import * as React from "react";
import { useContext, useEffect } from "react";
import { audioStore } from "./audio-store";
import { SchedulerInstance, SchedulerEvent } from "./scheduler";
import { usePrevious } from "../util/react-hooks";
import * as _ from "underscore";
import { useRemoveClientClip } from "../util/client-clip-state-hooks";
import Clip from "../component/workspace/clip/clip";
import { PlaybackContext } from "../component/workspace/context/recording/playback-context";

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
    offset: number;
    audio: {
      id: string;
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
  clipStart,
  contentStart,
  contentOffset,
  duration,
  storeKey
}: {
  id: string;
  clipStart: number;
  contentStart: number;
  contentOffset: number;
  duration?: number;
  storeKey: string;
}): SchedulerEvent => {
  if (contentOffset < 0) {
    throw new Error("Invariant: content offset should be non-negative.");
  }

  // Will be negative if content starts before clip.
  const contentStartRelative = contentStart - clipStart;

  const contentStartsBeforeClip = contentStartRelative < 0;

  const eventStartTime = contentStartsBeforeClip ? clipStart : contentStart;

  // Start playing content this many seconds into audio.
  const timeIntoContentToStart = contentStartsBeforeClip
    ? Math.max(-contentStartRelative, contentOffset)
    : contentOffset;

  return {
    id,
    start: eventStartTime,
    duration,
    offset: timeIntoContentToStart,
    type: "Audio",
    dispatch: async ({
      context,
      startTime,
      when,
      offset,
      duration
    }: {
      context: AudioContext;
      startTime: number;
      when: number;
      offset: number;
      duration: number;
    }): Promise<AudioScheduledSourceNode> => {
      const source = context.createBufferSource();

      if (!audioStore.getStoredAudio(storeKey).audioBuffer) {
        throw new Error("Tried to dispatch audio without decoded AudioBuffer.");
      }

      source.buffer = audioStore.getStoredAudio(storeKey).audioBuffer;
      source.connect(context.destination);

      const offsetVal = offset > 0 ? offset : 0;

      source.start(startTime + when, offsetVal, duration);

      return source;
    }
  };
};

/**
 * Calculates the real scheduler start time for a piece of clip content. If this
 * is negative, the negative portion of the content should not be played. This
 * is handled in `createContentEvent`.
 */
const calcContentStart = (
  clip: Clip,
  clipContent: Clip["content"][number]
): number => clip.start + clipContent.start;

/**
 * Calculates how long clip content should play for, respecting that it might
 * get cut off if the clip ends before it does and also that it might start
 * before the clip starts (so this returns the number of seconds after the audio
 * begins that it should stop).
 */
const calcContentDuration = (
  clip: Clip,
  clipContent: Clip["content"][number]
): number => {
  const contentStart = calcContentStart(clip, clipContent);
  let contentStartInClip = contentStart - clip.start;
  if (contentStartInClip < 0) contentStartInClip = 0;
  return Math.min(
    clipContent.duration - contentStartInClip,
    clip.duration - contentStartInClip
  );
};

/**
 * Called for every clip addition in cache.
 */
const onClipAdded = (clip: Clip, scheduler: Scheduler): void => {
  clip.content.forEach(content => {
    if (content.type.toLowerCase() === "audio") {
      if (content.audio.storedLocally) {
        scheduler.addEvent(
          createContentEvent({
            id: content.id,
            clipStart: clip.start,
            contentStart: calcContentStart(clip, content),
            contentOffset: content.offset,
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
        clipStart: clip.start,
        contentStart: calcContentStart(clip, clipContent),
        contentOffset: clipContent.offset,
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
        clipStart: clip.start,
        contentStart: calcContentStart(clip, clipContent),
        contentOffset: clipContent.offset,
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
  const eventUpdate: Partial<Parameters<Scheduler["updateEvent"]>[1]> = {};

  if (
    prevClip.start !== clip.start ||
    prevClipContent.start !== clipContent.start
  ) {
    const contentStart = calcContentStart(clip, clipContent);
    eventUpdate.start = clipContent.start >= 0 ? contentStart : clip.start;
  }

  if (
    prevClip.duration !== clip.duration ||
    prevClipContent.duration !== clipContent.duration
  )
    eventUpdate.duration = calcContentDuration(clip, clipContent);

  if (
    prevClipContent.start !== clipContent.start ||
    prevClipContent.offset !== clipContent.offset
  ) {
    eventUpdate.offset = Math.max(-clipContent.start, clipContent.offset);
  }

  if (!_.isEmpty(eventUpdate)) {
    scheduler.updateEvent(clipContent.id, eventUpdate);
  }
};

const onClipContentRemoved = (
  prevClipContent: Clip["content"][number],
  scheduler: Scheduler
): void => {
  if (prevClipContent.type.toLowerCase() === "audio") {
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
  countOffDuration: number,
  scheduler: Scheduler
): void => {
  if (prevClientClip.inProgress && !clientClip.inProgress) {
    scheduler.addEvent(
      createContentEvent({
        id: clientClip.audioStoreKey,
        clipStart: clientClip.start,
        contentStart:
          clientClip.start - clientClip.latencyCompensation - countOffDuration,
        contentOffset: 0,
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
export const ClipPlayer: React.FC<ClipPlayerProps> = ({
  clips,
  clientClips,
  audioStore,
  scheduler
}: ClipPlayerProps) => {
  const prev = usePrevious({ clips, clientClips });

  const { countOffData } = useContext(PlaybackContext);
  const countOffDuration = countOffData.duration ?? 0;

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
            onClientClipChanged(
              prevClientClip,
              clientClip,
              countOffDuration,
              scheduler
            );
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
  }, [clips, clientClips, prev, scheduler, removeClientClip, countOffDuration]);

  return null;
};
