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
import { useEffect, useState, useRef } from "react";
import { gql } from "apollo-boost";
import {
  ChildProps,
  useApolloClient,
  useMutation,
  useQuery
} from "react-apollo";
import { useCurrentUserId } from "../react-hooks";
import AudioStore from "./audio-store";
import ObjectID from "bson-objectid";
import ClipPlayer from "./clip-player";
import Looper from "./looper";
import { PLAY_CLIENT, STOP_CLIENT } from "../queries/vamp-mutations";
import {
  WorkspaceAudioClient,
  AddClientClip,
  AddClip,
  StopClient,
  PlayClient
} from "../state/apollotypes";

const WORKSPACE_AUDIO_CLIENT = gql`
  query WorkspaceAudioClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      id @client

      bpm @client
      beatsPerBar @client
      playing @client
      recording @client
      metronomeSound @client
      playPosition @client
      playStartTime @client

      start @client
      end @client
      loop @client

      clips @client {
        id @client
        start @client
        audio @client {
          id @client
          filename @client
          localFilename @client
          storedLocally @client
          duration @client
        }
      }

      clientClips @client {
        id @client
        start @client
        tempFilename @client
        duration @client
        storedLocally @client
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
  ) {
    addClip(
      clip: {
        userId: $userId
        vampId: $vampId
        file: $file
        referenceId: $referenceId
      }
    ) {
      id
    }
  }
`;

interface WorkspaceAudioProps {
  vampId: string;
}

const ADD_CLIENT_CLIP = gql`
  mutation AddClientClip($localFilename: String!, $start: Float!) {
    addClientClip(localFilename: $localFilename, start: $start) @client {
      id @client
      tempFilename @client
      storedLocally @client
      start @client
    }
  }
`;

const WorkspaceAudio = ({ vampId }: WorkspaceAudioProps): JSX.Element => {
  const startAudioContext = (): AudioContext => {
    try {
      // Typing for window augmented in externals.d.ts.
      // The webkit thing is Safari bullshit.
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      return context;
    } catch (e) {
      // TODO error handling.
      alert("Web audio not supported in this browser (TODO)");
    }
  };

  const {
    data: {
      vamp: {
        playing,
        recording,
        clips,
        clientClips,
        playPosition,
        playStartTime,
        start,
        end,
        loop
      }
    }
  } = useQuery<WorkspaceAudioClient>(WORKSPACE_AUDIO_CLIENT, {
    variables: { vampId }
  });

  const userId = useCurrentUserId();

  const [apolloPlay] = useMutation<PlayClient>(PLAY_CLIENT);
  const [apolloStop] = useMutation<StopClient>(STOP_CLIENT);

  const [addClientClip] = useMutation<AddClientClip>(ADD_CLIENT_CLIP);
  const [addClipServer] = useMutation<AddClip>(ADD_CLIP_SERVER);

  const apolloClient = useApolloClient();
  const [context] = useState(startAudioContext());
  const [scheduler] = useState(new Scheduler(context));
  const [recorder] = useState(new Recorder(context));
  const [audioStore] = useState(new AudioStore());

  const play = (): void => {
    scheduler.play();
  };

  const startRecording = (): void => {
    if (recorder.mediaRecorderInitialized()) {
      if (!playing) {
        console.info("Note: Started recording while not playing.");
      }
      recorder.startRecording();
    } else {
      // TODO Give a user-facing warning about microphone access.
      console.error("No microhpone access granted.");
      apolloStop();
    }
  };

  const stop = (): void => {
    scheduler.stop();
  };

  const seek = (time: number): void => {
    scheduler.seek(time);
  };

  // TODO If we end up needing to reuse this functionality it should be put in a
  // scripts file somewhere.
  /**
   * Basically "what the component state was before the last component state
   * change."
   */
  const usePrevious = <T,>(value: T): T => {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
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
  const endRecordingAndAddClip = async (): Promise<void> => {
    if (recorder.mediaRecorderInitialized()) {
      // We send a "reference ID" to the server so that we can immediately add
      // this clip client-side and then updated it later when we get the
      // subscription back from the server.
      const referenceId = ObjectID.generate();
      const file = await recorder.stopRecording();
      addClipServer({
        variables: {
          start: prevData.playPosition,
          vampId,
          userId,
          file,
          referenceId
        }
      });
      console.time("local clip cached in");
      const localClip = await addClientClip({
        variables: { localFilename: referenceId, start: prevData.playPosition }
      });
      audioStore.cacheClientClipAudio(
        localClip.data.addClientClip,
        vampId,
        file,
        apolloClient,
        context
      );
      console.timeEnd("local clip cached in");
    } else {
      // TODO User-facing warning.
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
    apolloClient.writeData({
      data: { vamp: { __typename: "Vamp", id: vampId, start, end } }
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
        startRecording();
      }
      if (!recording && prevData.recording) {
        endRecordingAndAddClip();
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
        seek(start);
      }

      // Check for removed Clips and ClientClips and stop their playback.
      const removeEventForClips = (
        clips: { id: string }[],
        prevClips: { id: string }[]
      ): void => {
        const removedIds: string[] = [];
        const prevIds = prevClips.map(clip => clip.id);
        const currIds = clips.map(clip => clip.id);
        prevIds.forEach(id => {
          if (!currIds.includes(id)) removedIds.push(id);
        });
        removedIds.forEach(id => scheduler.removeEvent(id));
      };
      removeEventForClips(clips, prevData.clips);
      removeEventForClips(clientClips, prevData.clientClips);
    }

    // Process clips' audio and do stuff that requires access to the metadata
    // from the audio.
    if (clips) {
      for (const clip of clips) {
        // This function checks if the clip has already been cached.
        audioStore.cacheClipAudio(clip, vampId, apolloClient, context);
      }
      updateStartEnd(clips);
    }
  });

  return (
    <>
      <Metronome audioContext={context} scheduler={scheduler}></Metronome>
      <ClipPlayer
        clips={clips}
        clientClips={clientClips}
        audioStore={audioStore}
        scheduler={scheduler}
      ></ClipPlayer>
      <Looper
        start={start}
        end={end}
        loop={loop}
        playing={playing}
        playPosition={playPosition}
        playStartTime={playStartTime}
      ></Looper>
    </>
  );
};

export { WorkspaceAudio };
