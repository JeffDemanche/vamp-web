import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActiveRecording,
  RecordingContext
} from "../../component/workspace/context/recording/recording-context";
import { usePrevious } from "../../util/react-hooks";
import { audioStore } from "../audio-store";
import { Scheduler, SchedulerEvent } from "../scheduler";

const createActiveRecordingEvent = (
  recording: ActiveRecording,
  loopNumber: number
): SchedulerEvent => {
  const start = Math.max(recording.recordingStart, recording.cabStart);
  const offsetFromLoopNumber = loopNumber * (recording.cabDuration ?? 0);
  const offset =
    recording.cabStart - recording.recordingStart + offsetFromLoopNumber;

  return {
    id: `active_${recording.audioStoreKey}_${loopNumber}`,
    start,
    duration: recording.cabDuration,
    type: "Audio",
    offset,
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

      const storedAudio = await audioStore.getStoredAudio(
        recording.audioStoreKey
      );

      if (!storedAudio) return;

      const audioBuffer = await context.decodeAudioData(
        await storedAudio.data.arrayBuffer()
      );

      source.buffer = audioBuffer;
      source.connect(context.destination);

      const offsetVal = offset > 0 ? offset : 0;

      source.start(startTime + when, offsetVal, duration);

      return source;
    }
  };
};

/**
 * Conceptually similar to `ContentAudioScheduleAdapter`. That component listens
 * to changes to content on clips and schedules/unschedules them. This does the
 * same for `ActiveRecordings`, which are temporary pieces of audio that we
 * can play seamlessly client-side. (See `RecordingContext` to see how and when
 * they're constructed).
 */
export const ActiveRecordingScheduleAdapter: React.FC<{
  scheduler: Scheduler;
}> = ({ scheduler }) => {
  const { activeRecording } = useContext(RecordingContext);

  const prevActiveRecording = usePrevious(activeRecording);

  const [scheduledEventIds, setScheduledEventIds] = useState<string[]>([]);

  // Handles scheduling the first active event for when loop mode is
  // infinite.
  useEffect(() => {
    if (
      activeRecording &&
      !prevActiveRecording &&
      activeRecording.cabDuration === undefined
    ) {
      const event = createActiveRecordingEvent(activeRecording, 0);
      setScheduledEventIds([...scheduledEventIds, event.id]);
      scheduler.addEvent(event);
    }
  }, [activeRecording, prevActiveRecording, scheduledEventIds, scheduler]);

  const [loopNumber, setLoopNumber] = useState(0);

  // Handles removing active event when it no longer exists.
  useEffect(() => {
    if (prevActiveRecording && !activeRecording) {
      scheduledEventIds.forEach(eventId => {
        scheduler.removeEvent(eventId);
      });
      setLoopNumber(1);
    }
  }, [activeRecording, prevActiveRecording, scheduledEventIds, scheduler]);

  const onSchedulerLoop = useCallback(() => {
    if (activeRecording) {
      const event = createActiveRecordingEvent(activeRecording, loopNumber);
      setScheduledEventIds([...scheduledEventIds, event.id]);
      scheduler.addEvent(event);
      setLoopNumber(loopNumber + 1);
    }
  }, [loopNumber, activeRecording, scheduledEventIds, scheduler]);

  useEffect(() => {
    scheduler.listeners.addListener(
      "afterLoop",
      onSchedulerLoop,
      "active_afterLoop_listener"
    );

    return (): void => {
      scheduler.listeners.removeListener("active_afterLoop_listener");
    };
  }, [onSchedulerLoop, scheduler]);

  return null;
};
