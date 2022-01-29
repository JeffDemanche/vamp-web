import { gql, useMutation } from "@apollo/client";
import { useContext } from "react";
import { useVampAudioContext } from "./use-vamp-audio-context";
import {
  AddClipNewRecordingMutation,
  CabMode,
  RecordingProgramInput,
  UpdateCabNewRecordingMutation
} from "../../state/apollotypes";
import { useCurrentUserId, useCurrentVampId } from "../../util/react-hooks";
import { MetronomeContext } from "../../component/workspace/context/metronome-context";
import { PlaybackContext } from "../../component/workspace/context/recording/playback-context";
import { useIsEmpty } from "../../component/workspace/hooks/use-is-empty";

const UPDATE_CAB_NEW_RECORDING_MUTATION = gql`
  mutation UpdateCabNewRecordingMutation(
    $userId: ID!
    $vampId: ID!
    $start: Float
    $duration: Float
  ) {
    updateUserInVamp(
      update: {
        userId: $userId
        vampId: $vampId
        cabStart: $start
        cabDuration: $duration
      }
    ) {
      id
    }
  }
`;

const ADD_CLIP_NEW_RECORDING_MUTATION = gql`
  mutation AddClipNewRecordingMutation(
    $userId: ID!
    $vampId: ID!
    $file: Upload!
    $recordingProgram: RecordingProgramInput!
  ) {
    addClip(
      clip: {
        userId: $userId
        vampId: $vampId
        file: $file
        recordingProgram: $recordingProgram
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

  const { truncateTime } = useContext(MetronomeContext);

  const userId = useCurrentUserId();
  const vampId = useCurrentVampId();

  const empty = useIsEmpty();

  const [addClip] = useMutation<AddClipNewRecordingMutation>(
    ADD_CLIP_NEW_RECORDING_MUTATION
  );
  const [updateCab] = useMutation<UpdateCabNewRecordingMutation>(
    UPDATE_CAB_NEW_RECORDING_MUTATION
  );

  const {
    countOffData: { duration: countOffDuration }
  } = useContext(PlaybackContext);

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

      // There's a bit of weirdness caused by having latencyCompensation defined
      // on front end programs... it gets applied to recordingStart before being
      // sent to the server.
      const recordingProgram: RecordingProgramInput = {
        recordingId,
        cabMode,
        cabStart,
        cabDuration,
        recordingStart: program.recordingStart - program.latencyCompensation,
        recordingDuration: audioDuration
      };

      if (empty) {
        const truncatedDuration = truncateTime(
          audioDuration - countOffDuration - latencyCompensation
        );
        updateCab({
          variables: {
            vampId,
            userId,
            start: cabStart,
            duration: truncatedDuration
          }
        });
      }

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
