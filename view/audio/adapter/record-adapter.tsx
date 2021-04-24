import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import { AddClipMutation, RecordAdapterQuery } from "../../state/apollotypes";
import {
  useBeginClientClip,
  useEndClientClip
} from "../../util/client-clip-state-hooks";
import { useStop } from "../../util/vamp-state-hooks";
import {
  useCurrentUserId,
  useCurrentVampId,
  usePrevious
} from "../../util/react-hooks";
import { SchedulerInstance } from "../scheduler";

interface RecordAdapterProps {
  scheduler: typeof SchedulerInstance;
  context: AudioContext;
}

const RECORD_ADAPTER_QUERY = gql`
  query RecordAdapterQuery($userId: ID!, $vampId: ID!) {
    vamp(id: $vampId) @client {
      recording
      playPosition
      countOff {
        duration
      }
    }
    userInVamp(userId: $userId, vampId: $vampId) @client {
      id
      cab {
        start
        duration
        loops
      }
      prefs {
        latencyCompensation
      }
    }
  }
`;

const ADD_CLIP_MUTATION = gql`
  mutation AddClipMutation(
    $userId: ID!
    $vampId: ID!
    $file: Upload!
    $contentStart: Float
    $latencyCompensation: Float
    $referenceId: ID
    $start: Float
    $duration: Float!
  ) {
    addClip(
      clip: {
        userId: $userId
        vampId: $vampId
        file: $file
        contentStart: $contentStart
        audioLatencyCompensation: $latencyCompensation
        referenceId: $referenceId
        start: $start
        duration: $duration
      }
    ) {
      id
    }
  }
`;

export const RecordAdapter: React.FC<RecordAdapterProps> = ({
  scheduler,
  context
}: RecordAdapterProps) => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const {
    data: {
      vamp: {
        recording,
        playPosition,
        countOff: { duration: countOffDuration }
      },
      userInVamp: {
        cab: { start: cabStart, duration: cabDuration, loops: cabLoops },
        prefs: { latencyCompensation }
      }
    }
  } = useQuery<RecordAdapterQuery>(RECORD_ADAPTER_QUERY, {
    variables: { userId, vampId }
  });

  const [currentRecordingId, setCurrentRecordingId] = useState<string>(null);

  const beginClientClip = useBeginClientClip();
  const endClientClip = useEndClientClip();

  const [addClip] = useMutation<AddClipMutation>(ADD_CLIP_MUTATION);

  const apolloStop = useStop();

  const prevData = usePrevious({ recording, playPosition });

  useEffect(() => {
    if (prevData) {
      if (recording && !prevData.recording) {
        if (scheduler.recorder.mediaRecorderInitialized()) {
          const recordingId = scheduler.primeRecorder(
            prevData.playPosition,
            async file => {
              const dataArrBuff = await file.arrayBuffer();
              const audioDuration = (await context.decodeAudioData(dataArrBuff))
                .duration;

              const duration = cabLoops ? cabDuration : audioDuration;

              const audioStart = -countOffDuration;

              addClip({
                variables: {
                  start: prevData.playPosition,
                  duration,
                  vampId,
                  userId,
                  file,
                  contentStart: audioStart,
                  latencyCompensation,
                  referenceId: recordingId
                }
              });
            }
          );

          if (currentRecordingId !== null)
            throw new Error("Current recording ID already set.");
          setCurrentRecordingId(recordingId);

          beginClientClip(
            prevData.playPosition,
            recordingId,
            latencyCompensation
          );
        } else {
          // TODO Give a user-facing warning about microphone access.
          console.error("No microhpone access granted.");
          apolloStop();
        }
      }
      if (!recording && prevData.recording) {
        endClientClip(currentRecordingId);
        setCurrentRecordingId(null);
      }
    }
  }, [
    addClip,
    apolloStop,
    beginClientClip,
    cabDuration,
    cabLoops,
    cabStart,
    context,
    countOffDuration,
    currentRecordingId,
    endClientClip,
    latencyCompensation,
    prevData,
    recording,
    scheduler,
    userId,
    vampId
  ]);

  return null;
};
