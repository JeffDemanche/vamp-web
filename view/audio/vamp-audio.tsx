/**
 * Root of all audio-interface-related code. I'm thinking taking a stab at
 * making this object-oriented might be a good first-attempt.
 */

import { Scheduler } from "./scheduler";
import Metronome from "./metronome";
import Recorder from "./recorder";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { gql } from "apollo-boost";
import {
  graphql,
  ChildProps,
  useApolloClient,
  useMutation
} from "react-apollo";
import { PLAY, STOP } from "../state/mutations";
import { useCurrentVampId, useCurrentUserId } from "../react-hooks";
import AudioStore from "./audio-store";
import getBlobDuration from "get-blob-duration";

type AudioData = {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  recording: boolean;
  metronomeSound: string;
  playPosition: number;
  playStartTime: number;

  clips: [
    {
      id: string;
      audio: {
        id: string;
        storedLocally: boolean;
        filename: string;
      };
    }
  ];
};

const ADD_CLIP_SERVER = gql`
  mutation AddClip($userId: ID!, $vampId: ID!, $file: Upload!) {
    addClip(clip: { userId: $userId, vampId: $vampId, file: $file }) {
      id
    }
  }
`;

const ConnectedWorkspaceAudio = ({
  data: { playing, recording, clips }
}: ChildProps<{}, AudioData>): JSX.Element => {
  const startAudioContext = (): AudioContext => {
    try {
      // Typing for window augmented in externals.d.ts.
      // The webkit thing is Safari bullshit.
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      return new AudioContext();
    } catch (e) {
      // TODO error handling.
      alert("Web audio not supported in this browser (TODO)");
    }
  };

  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const [apolloPlay] = useMutation(PLAY);
  const [apolloStop] = useMutation(STOP);

  const [addClipServer, { data, loading }] = useMutation(ADD_CLIP_SERVER);

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

  /**
   * Gets fired when the state of `recording` goes from true to false.
   */
  const endRecordingAndAddClip = async (): Promise<void> => {
    if (recorder.mediaRecorderInitialized()) {
      const file = await recorder.stopRecording();
      addClipServer({ variables: { vampId, userId, file } });
      // TODO add clip.
    } else {
      // TODO User-facing warning.
      console.error("Stopped audio because of no microphone access.");
    }
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

  const prevData = usePrevious({ playing, recording, clips });

  // Run on every state update. So whenever the props fed to this component from
  // Apollo are updated, we handle those changes here.
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
    }
    if (clips) {
      for (const clip of clips) {
        audioStore.cacheClipAudio(clip, apolloClient);
      }
    }
  });

  return (
    <>
      <Metronome audioContext={context} scheduler={scheduler}></Metronome>
    </>
  );
};

const WORKSPACE_AUDIO_QUERY = gql`
  query WorkspaceAudioData {
    bpm @client
    beatsPerBar @client
    playing @client
    recording @client
    metronomeSound @client
    playPosition @client
    playStartTime @client

    clips @client {
      id @client
      audio @client {
        id @client
        filename @client
      }
    }
  }
`;

const WorkspaceAudio = graphql<{}, AudioData>(WORKSPACE_AUDIO_QUERY)(
  ConnectedWorkspaceAudio
);

export { WorkspaceAudio };
