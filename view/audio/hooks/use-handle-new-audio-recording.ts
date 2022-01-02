import { gql, useMutation, useQuery } from "@apollo/client";
import { useContext } from "react";
import { useVampAudioContext } from "./use-vamp-audio-context";
import {
  AddClipNewRecordingMutation,
  CabMode,
  RecordingProgramInput
} from "../../state/apollotypes";
import { useCurrentUserId, useCurrentVampId } from "../../util/react-hooks";
import { useIsEmpty } from "../../util/workspace-hooks";
import { MetronomeContext } from "../../component/workspace/context/metronome-context";
import { PlaybackContext } from "../../component/workspace/context/recording/playback-context";
import { useLoopPoints } from "../../component/workspace/hooks/use-loop-points";

const ADD_CLIP_NEW_RECORDING_MUTATION = gql`
  mutation AddClipNewRecordingMutation(
    $userId: ID!
    $vampId: ID!
    $file: Upload!
    $recordingProgram: RecordingProgramInput!
    $referenceId: ID
  ) {
    addClip(
      clip: {
        userId: $userId
        vampId: $vampId
        file: $file
        recordingProgram: $recordingProgram
        referenceId: $referenceId
      }
    ) {
      id
    }
  }
`;

export interface RecorderProgram {
  recordingId: string;
  recordingStart: number;
  cabStart: number;
  cabDuration?: number;
  cabMode: CabMode;
  latencyCompensation: number;
}

/**
 * Gives components a function to be called when we get data from the media
 * recorder at the end of a recording.
 */
export const useHandleNewAudioRecording = (): {
  audioRecordingHandler: (
    file: Blob,
    program: RecorderProgram
  ) => Promise<void>;
} => {
  const context = useVampAudioContext();
  const { truncateEndOfRecording } = useContext(MetronomeContext);

  const userId = useCurrentUserId();
  const vampId = useCurrentVampId();

  const empty = useIsEmpty(vampId);

  const [addClip] = useMutation<AddClipNewRecordingMutation>(
    ADD_CLIP_NEW_RECORDING_MUTATION
  );

  const {
    recording,
    playPosition,
    countOffData: { duration: countOffDuration }
  } = useContext(PlaybackContext);

  const { loopPoints, mode } = useLoopPoints();

  return {
    audioRecordingHandler: async (
      file: Blob,
      program: RecorderProgram
    ): Promise<void> => {
      const {
        recordingId,
        cabMode,
        cabStart,
        cabDuration,
        latencyCompensation
      } = program;

      const dataArrBuff = await file.arrayBuffer();
      const audioDuration = (await context.decodeAudioData(dataArrBuff))
        .duration;

      const truncatedEndOfRecordingTime = truncateEndOfRecording(
        loopPoints[0] + audioDuration - countOffDuration - latencyCompensation
      );
      const emptyDuration =
        truncatedEndOfRecordingTime === 0
          ? audioDuration - countOffDuration - latencyCompensation
          : truncatedEndOfRecordingTime;
      const cabLoopsDuration = loopPoints[1]
        ? loopPoints[1] - loopPoints[0]
        : 0;
      const noLoopDuration = audioDuration;

      let duration = emptyDuration;
      if (!empty) {
        if (mode !== CabMode.INFINITE) duration = cabLoopsDuration;
        else duration = noLoopDuration;
      }

      const audioStart = -countOffDuration;

      const recordingProgram: RecordingProgramInput = {
        recordingStart: audioStart - latencyCompensation,
        recordingDuration: audioDuration,
        cabMode,
        cabStart,
        cabDuration
      };

      addClip({
        variables: {
          vampId,
          userId,
          file,
          recordingProgram,
          referenceId: recordingId
        }
      });
    }
  };
};
