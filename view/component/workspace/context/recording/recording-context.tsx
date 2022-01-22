import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useVampAudioContext } from "../../../../audio/hooks/use-vamp-audio-context";
import Recorder from "../../../../audio/recorder";
import { SchedulerInstance } from "../../../../audio/scheduler";
import {
  useCurrentUserId,
  useCurrentVampId,
  usePrevious
} from "../../../../util/react-hooks";
import {
  RecorderProgram,
  useHandleNewAudioRecording
} from "../../../../audio/hooks/use-handle-new-audio-recording";
import { PlaybackContext } from "./playback-context";
import { gql, useQuery } from "@apollo/client";
import { CabMode, RecordingProviderQuery } from "../../../../state/apollotypes";

const RECORDING_PROVIDER_QUERY = gql`
  query RecordingProviderQuery($userId: ID!, $vampId: ID!) {
    vamp(id: $vampId) @client {
      clips {
        id
        recordingId
      }
    }
    userInVamp(userId: $userId, vampId: $vampId) @client {
      id
      cab {
        mode
        start
        duration
      }
      prefs {
        latencyCompensation
      }
    }
  }
`;

export interface ActiveRecording {
  audioStoreKey: string;

  /** The Vamp-time in seconds at which the recording began. */
  recordingStart: number;

  /** The Vamp-time in seconds where the cab begins for this recording. */
  cabStart: number;

  /** Only defined if the recording program loops. */
  cabDuration?: number;

  numberOfLoops?: number;
}

export interface RecordingContextData {
  activeRecording?: ActiveRecording;
}

export const defaultRecordingContext: RecordingContextData = {
  activeRecording: undefined
};

export const RecordingContext = React.createContext<RecordingContextData>(
  defaultRecordingContext
);

interface RecordingProviderProps {
  children?: React.ReactChild | React.ReactChildren;
}

/**
 * This context handles recording functionality. `recoder.ts` hooks into
 * `Scheduler` events in conjunction with functionality in this provider to
 * handle recording media in-sync with the scheduler.
 */
export const RecordingProvider: React.FC = ({
  children
}: RecordingProviderProps) => {
  const context = useVampAudioContext();

  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const { data } = useQuery<RecordingProviderQuery>(RECORDING_PROVIDER_QUERY, {
    variables: { vampId, userId }
  });

  const clips = data?.vamp?.clips;

  const {
    cabMode,
    loopPointA,
    loopPointB,
    recording,
    countOffData
  } = useContext(PlaybackContext);

  const [scheduler] = useState(SchedulerInstance);
  const [recorder] = useState(() => new Recorder(context, scheduler));

  const [activeRecording, setActiveRecording] = useState<ActiveRecording>(
    undefined
  );

  const { audioRecordingHandler } = useHandleNewAudioRecording();

  const { prevRecording } = usePrevious({ prevRecording: recording }) ?? {};

  const programArgs: Omit<RecorderProgram, "recordingId"> = useMemo(() => {
    return {
      cabMode,
      cabStart: loopPointA,
      cabDuration: cabMode !== CabMode.INFINITE ? loopPointB : undefined,
      latencyCompensation: data.userInVamp.prefs.latencyCompensation,
      recordingStart: data.userInVamp.cab.start - countOffData.duration
    };
  }, [
    cabMode,
    countOffData.duration,
    data.userInVamp.cab.start,
    data.userInVamp.prefs.latencyCompensation,
    loopPointA,
    loopPointB
  ]);

  const addActiveRecording = useCallback(
    (audioStoreKey: string, program: Omit<RecorderProgram, "recordingId">) => {
      const newActiveRecording: ActiveRecording = {
        audioStoreKey,
        recordingStart: program.recordingStart,
        cabStart: program.cabStart,
        cabDuration: program.cabDuration
      };
      setActiveRecording(newActiveRecording);
    },
    [setActiveRecording]
  );

  const removeActiveRecording = useCallback(() => {
    setActiveRecording(undefined);
  }, [setActiveRecording]);

  // Listens to recording state changing and primes/stops the recorder when it
  // happens. (We don't actually start recording from here, that happens in a
  // function in Recorder that listens to Scheduler changes).
  useEffect(() => {
    if (prevRecording !== undefined && recording && !prevRecording) {
      const recordingId = recorder.prime(audioRecordingHandler, programArgs);

      addActiveRecording(recordingId, programArgs);
    }
    if (prevRecording !== undefined && !recording && prevRecording) {
      recorder.stopRecording();
    }
  }, [
    addActiveRecording,
    audioRecordingHandler,
    activeRecording,
    prevRecording,
    programArgs,
    recorder,
    recording
  ]);

  // Listens for new clips with referenceId's equal to active recordings and
  // removes those active recordings.
  useEffect(() => {
    if (activeRecording) {
      clips &&
        clips.forEach(clip => {
          if (activeRecording.audioStoreKey === clip.recordingId) {
            removeActiveRecording();
          }
        });
    }
  }, [clips, activeRecording, removeActiveRecording]);

  useEffect(() => {
    return (): void => {
      recorder.deconstruct();
    };
  }, []);

  return (
    <RecordingContext.Provider value={{ activeRecording }}>
      {children}
    </RecordingContext.Provider>
  );
};
