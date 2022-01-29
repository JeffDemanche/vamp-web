import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActiveRecording,
  RecordingContext
} from "../../component/workspace/context/recording/recording-context";
import { usePrevious } from "../../util/react-hooks";
import { audioStore } from "../audio-store";
import { Scheduler, SchedulerEvent } from "../scheduler";

export const createActiveRecordingEvent = (
  recording: ActiveRecording,
  loopNumber: number
): SchedulerEvent => {
  if (loopNumber > 0 && recording.cabDuration === undefined) {
    throw new Error(
      "Can't create active recording with non-zero loop number and no cab duration."
    );
  }

  const recordingStartWithLatency =
    recording.recordingStart - recording.latencyCompensation;

  // Infinity condition
  let start = Math.max(recording.cabStart, recordingStartWithLatency);
  let duration = recording.cabDuration;
  let offset = Math.abs(
    Math.min(recordingStartWithLatency - recording.cabStart, 0)
  );

  // Looping case
  if (recording.cabDuration !== undefined) {
    const recordingStartRelative =
      recordingStartWithLatency - recording.cabStart;
    const firstLoopStartRelative = Math.max(recordingStartRelative, 0);
    const firstLoopDuration = recording.cabDuration - firstLoopStartRelative;
    const firstLoopOffset = Math.abs(Math.min(recordingStartRelative, 0));

    if (loopNumber === 0) {
      start = recording.cabStart + firstLoopStartRelative;
      duration = firstLoopDuration;
      offset = firstLoopOffset;
    } else {
      const offsetFromLoopNumber =
        (loopNumber - 1) * (recording.cabDuration ?? 0);
      const loopOffset =
        firstLoopOffset + firstLoopDuration + offsetFromLoopNumber;

      start = recording.cabStart;
      duration = recording.cabDuration;
      offset = loopOffset;
    }
  }

  return {
    id: `active_${recording.audioStoreKey}_${loopNumber}`,
    start,
    duration,
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
      setLoopNumber(0);
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
