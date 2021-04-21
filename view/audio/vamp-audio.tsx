/**
 * This file is sort of the root of all actual audio playback capabilities.
 * WorkspaceAudio is a component, meaning it can recieve state updates straight
 * from Apollo and reflect those updates in the audio playback (much like how a
 * visual component reflects updates in how it renders). For instance, if the
 * state of "playing" changes, WorkspaceAudio can listen for that and play or
 * pause the audio accordingly.
 */

import { SchedulerInstance } from "./scheduler";
import * as React from "react";
import { useEffect, useState } from "react";
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useCurrentUserId, usePrevious } from "../util/react-hooks";
import { audioStore } from "./audio-store";
import { vampAudioContext } from "./vamp-audio-context";
import { ClipPlayer } from "./clip-player";
import Looper from "./looper";
import { WorkspaceAudioClient, AddClip } from "../state/apollotypes";
import { useSetLoop, useStop } from "../state/vamp-state-hooks";
import {
  useEndClientClip,
  useBeginClientClip
} from "../state/client-clip-state-hooks";
import { FloorAdapter } from "./floor/floor-adapter";
import { CountOffAdapter } from "./count-off-adapter";
import { SeekAdapter } from "./adapter/seek-adapter";
import { PlayStopAdapter } from "./adapter/play-stop-adapter";

const WORKSPACE_AUDIO_CLIENT = gql`
  query WorkspaceAudioClient($vampId: ID!, $userId: ID!) {
    vamp(id: $vampId) @client {
      id

      bpm
      beatsPerBar
      playing
      recording
      metronomeSound
      playPosition
      playStartTime

      start
      end
      loop

      clips {
        id
        start
        duration
        content {
          id
          type
          start
          duration
          audio {
            id
            filename
            localFilename
            latencyCompensation
            storedLocally
            duration
          }
        }
      }

      clientClips {
        start
        audioStoreKey
        realClipId
        inProgress
        duration
        latencyCompensation
      }

      sections {
        id
        name
        bpm
        beatsPerBar
        metronomeSound
        startMeasure
        repetitions
        subSections {
          id
        }
      }

      forms {
        preSection {
          id
        }
        insertedSections {
          id
        }
        postSection {
          id
        }
      }
    }
    userInVamp(vampId: $vampId, userId: $userId) @client {
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

const ADD_CLIP_SERVER = gql`
  mutation AddClip(
    $userId: ID!
    $vampId: ID!
    $file: Upload!
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

interface WorkspaceAudioProps {
  vampId: string;
}

const WorkspaceAudio = ({ vampId }: WorkspaceAudioProps): JSX.Element => {
  const startAudioContext = (): AudioContext => {
    try {
      return vampAudioContext.getAudioContext();
    } catch (e) {
      // TODO error handling.
      alert("Web audio not supported in this browser (TODO)");
    }
  };

  const userId = useCurrentUserId();

  // State query for clientside Vamp playback info.
  const {
    data: {
      vamp: {
        playing,
        recording,
        clips,
        clientClips,
        playPosition,
        playStartTime,
        sections,
        forms
      },
      userInVamp: {
        cab: { start: cabStart, duration: cabDuration, loops: cabLoops },
        prefs: { latencyCompensation }
      }
    }
  } = useQuery<WorkspaceAudioClient>(WORKSPACE_AUDIO_CLIENT, {
    variables: { vampId, userId }
  });

  const [addClipServer] = useMutation<AddClip>(ADD_CLIP_SERVER);

  const apolloStop = useStop();
  const setLoop = useSetLoop();
  const beginClientClip = useBeginClientClip();
  const endClientClip = useEndClientClip();

  const apolloClient = useApolloClient();
  const [context] = useState(startAudioContext());
  const [scheduler] = useState(SchedulerInstance);
  const [store] = useState(audioStore);

  const [currentRecordingId, setCurrentRecordingId] = useState<string>(null);

  // Passes the audio context into the scheduler instance.
  useEffect(() => {
    scheduler.giveContext(context);
  }, [context, scheduler]);

  /**
   * The values passed here will be tracked between state changes.
   */
  const prevData = usePrevious({
    playing,
    recording,
    clips,
    clientClips,
    playPosition,
    playStartTime
  });

  /**
   * Called on every clips update (see the useEffect hook). After the audio for
   * all clips is downloaded, its duration is set in the local cache, so we wait
   * until then to set the start and end times for the Vamp timeline.
   */
  const updateStartEnd = (
    clips: {
      start: number;
      duration: number;
      content: {
        start: number;
        duration: number;
      }[];
    }[]
  ): void => {
    let start = 0;
    clips.forEach(clip => {
      if (clip.start < start) {
        start = clip.start;
      }
    });
    let end = start;
    clips.forEach(clip => {
      clip.content.forEach(content => {
        if (clip.start + content.start + content.duration > end) {
          end = clip.start + content.start + content.duration;
        }
      });
    });
    apolloClient.cache.modify({
      id: apolloClient.cache.identify({ __typename: "Vamp", id: vampId }),
      fields: {
        start(): number {
          return start;
        },
        end(): number {
          return end;
        }
      }
    });
  };

  /**
   * FORM DATA
   *
   * Handles changes to form.
   */
  useEffect(() => {
    const vampFormData = { sections, forms };
    scheduler.updateMetronome(vampFormData, playStartTime);
  }, [sections, forms, scheduler]);

  /**
   * RECORD DATA
   *
   * Handles changes to recording.
   */
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

              const limitedDuration = cabDuration - cabStart;

              const duration = cabLoops ? limitedDuration : audioDuration;

              addClipServer({
                variables: {
                  start: prevData.playPosition,
                  duration,
                  vampId,
                  userId,
                  file,
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
    addClipServer,
    apolloStop,
    beginClientClip,
    cabDuration,
    cabLoops,
    cabStart,
    context,
    currentRecordingId,
    endClientClip,
    latencyCompensation,
    playing,
    prevData,
    recording,
    scheduler,
    userId,
    vampId
  ]);

  /**
   * CLIPS DATA
   *
   * Handles changes to clips (and client clips).
   */
  useEffect(() => {
    const empty =
      (clips === undefined || clips.length == 0) &&
      (clientClips === undefined || clientClips.length == 0);
    setLoop(!empty);

    // Process clips' audio and do stuff that requires access to the metadata
    // from the audio.
    if (clips) {
      for (const clip of clips) {
        // This function checks if the clip has already been cached.
        store.cacheClipAudio(clip, vampId, apolloClient, context);
      }
      updateStartEnd(clips);
    }
  }, [clips, clientClips]);

  return (
    <>
      <ClipPlayer
        clips={clips}
        clientClips={clientClips}
        audioStore={store}
        scheduler={scheduler}
      ></ClipPlayer>
      <Looper
        start={cabStart}
        end={cabDuration + cabStart}
        loops={cabLoops}
        playing={playing}
      ></Looper>
      <PlayStopAdapter scheduler={scheduler}></PlayStopAdapter>
      <FloorAdapter></FloorAdapter>
      <CountOffAdapter scheduler={scheduler}></CountOffAdapter>
      <SeekAdapter scheduler={scheduler}></SeekAdapter>
    </>
  );
};

export { WorkspaceAudio };
