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
import { useCallback, useEffect, useState } from "react";
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useCurrentUserId, usePrevious } from "../util/react-hooks";
import { audioStore } from "./audio-store";
import { vampAudioContext } from "./vamp-audio-context";
import ClipPlayer from "./clip-player";
import Looper from "./looper";
import { WorkspaceAudioClient, AddClip, CabClient } from "../state/apollotypes";
import { CAB_CLIENT } from "../state/queries/user-in-vamp-queries";
import { useSetLoop, useStop } from "../state/vamp-state-hooks";
import {
  useEndClientClip,
  useBeginClientClip
} from "../state/client-clip-state-hooks";
import { FloorAdapter } from "./floor/floor-adapter";

const WORKSPACE_AUDIO_CLIENT = gql`
  query WorkspaceAudioClient($vampId: ID!) {
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
        audio {
          id
          filename
          localFilename
          storedLocally
          duration
        }
      }

      clientClips {
        start
        audioStoreKey
        realClipId
        inProgress
        duration
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
  }
`;

const ADD_CLIP_SERVER = gql`
  mutation AddClip(
    $userId: ID!
    $vampId: ID!
    $file: Upload!
    $referenceId: ID
    $start: Float
  ) {
    addClip(
      clip: {
        userId: $userId
        vampId: $vampId
        file: $file
        referenceId: $referenceId
        start: $start
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
      }
    }
  } = useQuery<WorkspaceAudioClient>(WORKSPACE_AUDIO_CLIENT, {
    variables: { vampId }
  });

  // State query for cab info.
  const { data: userInVampData } = useQuery<CabClient>(CAB_CLIENT, {
    variables: { vampId, userId }
  });
  const {
    userInVamp: {
      cab: { start: cabStart, duration: cabDuration, loops: cabLoops }
    }
  } = userInVampData || {
    userInVamp: { cab: { cabStart: 0, cabDuration: 0, cabLoops: false } }
  };

  const [addClipServer] = useMutation<AddClip>(ADD_CLIP_SERVER);

  const apolloStop = useStop();
  const setLoop = useSetLoop();
  const beginClientClip = useBeginClientClip();
  const endClientClip = useEndClientClip();

  const apolloClient = useApolloClient();
  const [context] = useState(startAudioContext());
  const [scheduler] = useState(SchedulerInstance);
  // const [recorder] = useState(new Recorder(context));
  const [store] = useState(audioStore);

  // Passes the audio context into the scheduler instance.
  useEffect(() => {
    scheduler.giveContext(context);
  }, [context, scheduler]);

  const play = useCallback((): void => {
    scheduler.play();
  }, [scheduler]);

  const seek = useCallback(
    (time: number): void => {
      scheduler.seek(time);
    },
    [scheduler]
  );

  const stop = useCallback((): void => {
    scheduler.stop();
  }, [scheduler]);

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
      audio: { duration: number };
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
      if (clip.start + clip.audio.duration > end) {
        end = clip.start + clip.audio.duration;
      }
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
   * PLAY DATA
   *
   * Handles changes to playing and recording.
   */
  useEffect(() => {
    if (prevData) {
      if (recording && !prevData.recording) {
        if (scheduler.recorder.mediaRecorderInitialized()) {
          const recordingId = scheduler.primeRecorder(
            prevData.playPosition,
            file => {
              addClipServer({
                variables: {
                  start: prevData.playPosition,
                  vampId,
                  userId,
                  file,
                  referenceId: recordingId
                }
              });
              endClientClip(recordingId);
            }
          );
          beginClientClip(prevData.playPosition, recordingId);
        } else {
          // TODO Give a user-facing warning about microphone access.
          console.error("No microhpone access granted.");
          apolloStop();
        }
      }
      if (playing && !prevData.playing) {
        play();
      }
      if (!playing && prevData.playing) {
        stop();
      }
    }
  }, [
    addClipServer,
    apolloStop,
    beginClientClip,
    endClientClip,
    play,
    playing,
    prevData,
    recording,
    scheduler,
    stop,
    userId,
    vampId
  ]);

  // Run on every state update. So whenever the props fed to this component from
  // Apollo are updated, we handle those changes here. Think of this as the
  // interface between the Apollo state and the behavior of the audio module.
  useEffect(() => {
    if (prevData) {
      // Signals that some seek has occured while playing, such as restarting at
      // the beginning during a loop.
      if (
        prevData &&
        playing &&
        prevData.playing &&
        playStartTime != prevData.playStartTime
      ) {
        seek(cabStart);
      }

      // Signalled when when a seek occured while not playing.
      if (!playing && playPosition != prevData.playPosition) {
        seek(playPosition);
      }
    }
  });

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
      <FloorAdapter></FloorAdapter>
    </>
  );
};

export { WorkspaceAudio };
