import * as React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
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
import { RecordingProviderQuery } from "../../../../state/apollotypes";

const RECORDING_PROVIDER_QUERY = gql`
  query RecordingProviderQuery($userId: ID!, $vampId: ID!) {
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

export interface OptimisticRecording {
  audioStoreKey: string;
}

export interface RecordingContextData {
  optimisticRecordings: OptimisticRecording[];
}

export const defaultRecordingContext: RecordingContextData = {
  optimisticRecordings: []
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

  const { recording, countOffData } = useContext(PlaybackContext);

  const [scheduler] = useState(SchedulerInstance);
  const [recorder] = useState(() => new Recorder(context, scheduler));

  // Set to an identifier generated when the recorder is primed.
  const [currentRecordingId, setCurrentRecordingId] = useState<string>(
    undefined
  );

  const { audioRecordingHandler } = useHandleNewAudioRecording();

  const { prevRecording } = usePrevious({ prevRecording: recording }) ?? {};

  const programArgs: Omit<RecorderProgram, "recordingId"> = useMemo(() => {
    return {
      cabMode: data.userInVamp.cab.mode,
      cabStart: data.userInVamp.cab.start,
      cabDuration: data.userInVamp.cab.duration,
      latencyCompensation: data.userInVamp.prefs.latencyCompensation,
      recordingStart: data.userInVamp.cab.start - countOffData.duration
    };
  }, [
    countOffData.duration,
    data.userInVamp.cab.duration,
    data.userInVamp.cab.mode,
    data.userInVamp.cab.start,
    data.userInVamp.prefs.latencyCompensation
  ]);

  useEffect(() => {
    if (prevRecording !== undefined && recording && !prevRecording) {
      setCurrentRecordingId(recorder.prime(audioRecordingHandler, programArgs));
    }
    if (prevRecording !== undefined && !recording && prevRecording) {
      recorder.stopRecording();
    }
  }, [audioRecordingHandler, prevRecording, programArgs, recorder, recording]);

  useEffect(() => {
    return (): void => {
      recorder.deconstruct();
    };
  }, []);

  return (
    <RecordingContext.Provider value={{ optimisticRecordings: [] }}>
      {children}
    </RecordingContext.Provider>
  );
};
