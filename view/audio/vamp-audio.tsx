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
import { graphql, ChildProps, useApolloClient } from "react-apollo";

type AudioData = {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  metronomeSound: string;
  playPosition: number;
  playStartTime: number;
};

const ConnectedWorkspaceAudio = ({
  data: { playing }
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

  const apolloClient = useApolloClient();
  const [context] = useState(startAudioContext());
  const [scheduler] = useState(new Scheduler(context));
  const [recorder] = useState(new Recorder(context));

  const play = (): void => {
    if (recorder.startRecording()) {
      scheduler.play();
    } else {
      // TODO Give a user-facing warning about microphone access.
      console.error("No microhpone access granted.");
      apolloClient.writeData({ data: { playing: false } });
    }
  };

  const stop = (): void => {
    if (recorder.stopRecording()) {
      scheduler.stop();
    } else {
      // TODO User-facing warning.
      console.error("Stopped audio because of no microphone access.");
    }
  };

  // TODO If we end up needing to reuse this functionality it should be put in a
  // scripts file somewhere.
  const usePrevious = <T,>(value: T): T => {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevData = usePrevious({ playing });

  useEffect(() => {
    // Equivalent to componentDidMount().
    if (prevData) {
      if (playing && !prevData.playing) {
        play();
      }
      if (!playing && prevData.playing) {
        stop();
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
    metronomeSound @client
    playPosition @client
    playStartTime @client
  }
`;

const WorkspaceAudio = graphql<{}, AudioData>(WORKSPACE_AUDIO_QUERY)(
  ConnectedWorkspaceAudio
);

export { WorkspaceAudio };
