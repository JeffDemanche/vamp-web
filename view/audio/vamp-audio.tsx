/**
 * This file is sort of the root of all actual audio playback capabilities.
 * WorkspaceAudio is a component, meaning it can recieve state updates straight
 * from Apollo and reflect those updates in the audio playback (much like how a
 * visual component reflects updates in how it renders). For instance, if the
 * state of "playing" changes, WorkspaceAudio can listen for that and play or
 * pause the audio accordingly.
 */

import { Scheduler } from "./scheduler";
import Metronome from "./metronome";
import Recorder from "./recorder";
import * as React from "react";
import { useEffect, useState } from "react";
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useCurrentUserId, usePrevious } from "../react-hooks";
import { audioStore } from "./audio-store";
import { vampAudioContext } from "./vamp-audio-context";
import ObjectID from "bson-objectid";
import ClipPlayer from "./clip-player";
import Looper from "./looper";
import { WorkspaceAudioClient, AddClip } from "../state/apollotypes";
import { vampAudioStream } from "./vamp-audio-stream";
import { useSetLoop, useStop } from "../state/vamp-state-hooks";
import {
  useEndClientClip,
  useBeginClientClip
} from "../state/client-clip-state-hooks";

const WORKSPACE_AUDIO_CLIENT = gql`
  query WorkspaceAudioClient($vampId: ID!, $userId: ID!) {
    vamp(id: $vampId) @client {
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
    }
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      cab {
        start
        duration
        loops
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
  const { data, loading, error } = useQuery<WorkspaceAudioClient>(
    WORKSPACE_AUDIO_CLIENT,
    {
      variables: { vampId, userId }
    }
  );

  const {
    vamp: {
      playing,
      recording,
      clips,
      clientClips,
      playPosition,
      playStartTime
    },
    userInVamp: {
      cab: { start: cabStart, duration: cabDuration, loops: cabLoops }
    }
  } = data;

  const [addClipServer] = useMutation<AddClip>(ADD_CLIP_SERVER);

  const apolloStop = useStop();
  const setLoop = useSetLoop();
  const beginClientClip = useBeginClientClip();
  const endClientClip = useEndClientClip();

  const [clientClipAudioStoreKey, setClientClipAudioStoreKey] = useState<
    string
  >(null);

  const apolloClient = useApolloClient();
  const [context] = useState(startAudioContext());
  const [scheduler] = useState(new Scheduler(context));
  const [recorder] = useState(new Recorder(context));
  const [store] = useState(audioStore);

  const play = (): void => {
    scheduler.play();
  };

  const startRecording = async (start: number): Promise<void> => {
    if (recorder.mediaRecorderInitialized()) {
      if (!playing) {
        console.info("Note: Started recording while not playing.");
      }

      const clientClipAudioStoreKey = ObjectID.generate();
      setClientClipAudioStoreKey(clientClipAudioStoreKey);
      recorder.startRecording(clientClipAudioStoreKey);

      beginClientClip(start, clientClipAudioStoreKey);
    } else {
      // TODO Give a user-facing warning about microphone access.
      console.error("No microhpone access granted.");
      apolloStop();
    }
  };

  const seek = (time: number): void => {
    scheduler.seek(time);
  };

  const setPlayPosition = (time: number): void => {
    scheduler.setTime(time);
  };

  const stop = (): void => {
    scheduler.stop();
  };

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
   * Gets fired when the state of `recording` goes from true to false.
   */
  const endRecordingAndAddClip = async (start: number): Promise<void> => {
    if (recorder.mediaRecorderInitialized()) {
      // We send a "reference ID" to the server so that we can immediately add
      // this clip client-side and then updated it later when we get the
      // subscription back from the server.
      const file = await recorder.stopRecording();
      if (clientClipAudioStoreKey) {
        addClipServer({
          variables: {
            start,
            vampId,
            userId,
            file,
            referenceId: clientClipAudioStoreKey
          }
        });
        endClientClip(clientClipAudioStoreKey);
      }
    } else {
      vampAudioStream.sendAlert();
      console.error("Stopped audio because of no microphone access.");
    }
  };

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

  // Run on every state update. So whenever the props fed to this component from
  // Apollo are updated, we handle those changes here. Think of this as the
  // interface between the Apollo state and the behavior of the audio module.
  useEffect(() => {
    if (prevData) {
      // NOTE record() and endRecordingAndAddClip() don't deal with playback. If
      // the play control mutations are properly set up in resolvers.ts, play()
      // and stop() should be appropriately called.
      if (recording && !prevData.recording) {
        startRecording(prevData.playPosition);
      }
      if (!recording && prevData.recording) {
        endRecordingAndAddClip(cabStart);
      }
      if (playing && !prevData.playing) {
        play();
      }
      if (!playing && prevData.playing) {
        stop();
      }

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
        setPlayPosition(playPosition);
      }

      scheduler.setIdleTime(cabStart);
    }
  });

  // UseEffect for clips and clientClips.
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
      <Metronome audioContext={context} scheduler={scheduler}></Metronome>
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
    </>
  );
};

export { WorkspaceAudio };
