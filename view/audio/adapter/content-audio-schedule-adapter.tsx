import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { useEffect, useMemo } from "react";
import {
  ContentAudioSchedulerAdapterQuery,
  ContentAudioSchedulerAdapterQuery_vamp_clips
} from "../../state/apollotypes";
import { useCurrentVampId, usePrevious } from "../../util/react-hooks";
import { audioStore } from "../audio-store";
import { Scheduler, SchedulerEvent } from "../scheduler";

export const CONTENT_AUDIO_SCHEDULE_ADAPTER_QUERY = gql`
  query ContentAudioSchedulerAdapterQuery($vampId: ID!) {
    vamp(id: $vampId) {
      id
      clips {
        id
        start
        duration
        content {
          id
          type
          start
          duration
          offset
          audio {
            id
          }
        }
      }
    }
  }
`;

interface SchedulableEventInClip {
  contentId: string;
  contentStart: number;
  contentDuration: number;
  contentOffset: number;
  clipId: string;
  clipStart: number;
  clipDuration: number;
  audioId: string;
}

/**
 * Takes information about a single content in a clip, and calculates the
 * scheduling parameters for the resulting event.
 */
export const calculateEventScheduling = (
  event: SchedulableEventInClip
): { start: number; duration: number; offset: number } => {
  const clipEnd = event.clipStart + event.clipDuration;
  const contentStart = event.clipStart + event.contentStart;
  const contentEnd = contentStart + event.contentDuration;

  const start = contentStart > event.clipStart ? contentStart : event.clipStart;
  const end = contentEnd < clipEnd ? contentEnd : clipEnd;
  const duration = end - start;

  // This accounts for two reasons the content might not play from it's
  // beginning: 1. it could have an offset value and 2. the content could start
  // before the clip starts.
  const offset = event.contentOffset + Math.max(0, -event.contentStart);

  return {
    start,
    duration,
    offset
  };
};

const createContentEvent = ({
  id,
  start,
  duration,
  contentOffset,
  storeKey
}: {
  id: string;
  start: number;
  duration: number;
  contentOffset: number;
  storeKey: string;
}): SchedulerEvent => {
  if (contentOffset < 0) {
    throw new Error("Invariant: content offset should be non-negative.");
  }

  return {
    id,
    start,
    duration,
    offset: contentOffset,
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

      const storedAudio = await audioStore.awaitStoredAudio(storeKey);

      source.buffer = await storedAudio.awaitAudioBuffer();
      source.connect(context.destination);

      const offsetVal = offset > 0 ? offset : 0;

      source.start(startTime + when, offsetVal, duration);

      return source;
    }
  };
};

/**
 * Responsible for listening to changes in the object model w/r/t audio content,
 * and updating the scheduler to reflect those changes. In other words, this
 * adapter makes sure that all content audio from the timeline is scheduled to
 * play synchronously with how it appears presentationally.
 */
export const ContentAudioScheduleAdapter: React.FC<{
  scheduler: Scheduler;
}> = ({ scheduler }) => {
  const vampId = useCurrentVampId();

  const blankClips: ContentAudioSchedulerAdapterQuery_vamp_clips[] = [];
  const {
    data: { vamp: { clips } } = { vamp: { clips: blankClips } }
  } = useQuery<ContentAudioSchedulerAdapterQuery>(
    CONTENT_AUDIO_SCHEDULE_ADAPTER_QUERY,
    {
      variables: { vampId },
      fetchPolicy: "cache-only"
    }
  );

  // Step 1: normalize data.
  const thisRenderContent: SchedulableEventInClip[] = useMemo(
    () =>
      clips
        .map(clip =>
          clip.content.map(content => ({
            contentId: content.id,
            contentStart: content.start,
            contentDuration: content.duration,
            contentOffset: content.offset,
            clipId: clip.id,
            clipStart: clip.start,
            clipDuration: clip.duration,
            audioId: content.audio.id
          }))
        )
        .flat(),
    [clips]
  );

  const prevRenderContentOptional = usePrevious(thisRenderContent);

  // Step 2: determine which scheduler updates should occur based on state
  // changes between this render and the last.
  const eventDiff: {
    added: SchedulableEventInClip[];
    changed: SchedulableEventInClip[];
    removed: SchedulableEventInClip[];
  } = useMemo(() => {
    const prevRenderContent = prevRenderContentOptional ?? [];

    const hashEvent = (event: SchedulableEventInClip): string =>
      `${event.contentId}${event.clipId}`;

    const thisRenderHashedIds = new Set(thisRenderContent.map(hashEvent));
    const prevRenderHashedIds = prevRenderContent
      ? new Set(prevRenderContent.map(hashEvent))
      : new Set();

    const prevRenderHashMap: {
      [hash: string]: SchedulableEventInClip;
    } = prevRenderContent.reduce(
      (map, event) => {
        map[hashEvent(event)] = event;
        return map;
      },
      {} as {
        [hash: string]: SchedulableEventInClip;
      }
    );

    const added = Array.from(thisRenderContent).filter(
      event => !prevRenderHashedIds.has(hashEvent(event))
    );
    const removed = Array.from(prevRenderContent).filter(
      event => !thisRenderHashedIds.has(hashEvent(event))
    );
    const changed = thisRenderContent.filter(thisEvent => {
      if (!prevRenderHashedIds.has(hashEvent(thisEvent))) {
        return false;
      }

      const thisEventScheduling = calculateEventScheduling(thisEvent);
      const prevEventScheduling = calculateEventScheduling(
        prevRenderHashMap[hashEvent(thisEvent)]
      );

      return !(
        thisEventScheduling.start === prevEventScheduling.start &&
        thisEventScheduling.duration === prevEventScheduling.duration &&
        thisEventScheduling.offset === prevEventScheduling.offset
      );
    });

    return { added, changed, removed };
  }, [prevRenderContentOptional, thisRenderContent]);

  // Step 3: Take the diff information and apply it to the scheduler.
  useEffect(() => {
    const { added, changed, removed } = eventDiff;

    added.forEach(addedEvent => {
      const { start, duration, offset } = calculateEventScheduling(addedEvent);
      if (duration > 0) {
        const event = createContentEvent({
          id: addedEvent.contentId,
          start,
          duration,
          contentOffset: offset,
          storeKey: addedEvent.audioId
        });
        scheduler.addEvent(event);
      }
    });
    changed.forEach(changedEvent => {
      const { start, duration, offset } = calculateEventScheduling(
        changedEvent
      );
      if (scheduler.events[changedEvent.contentId]) {
        if (duration > 0) {
          scheduler.updateEvent(changedEvent.contentId, {
            start,
            duration,
            offset
          });
        } else {
          scheduler.removeEvent(changedEvent.contentId);
        }
      } else {
        // This case (where an event "changed" but it wasn't already in the
        // scheduler) could happen in the case where an event had negative
        // duration on last render but positive duration on this render.
        if (duration > 0) {
          scheduler.addEvent(
            createContentEvent({
              id: changedEvent.contentId,
              start,
              duration,
              contentOffset: offset,
              storeKey: changedEvent.audioId
            })
          );
        }
      }
    });
    removed.forEach(removedEvent => {
      scheduler.removeEvent(removedEvent.contentId);
    });
  }, [eventDiff, scheduler]);

  return null;
};
