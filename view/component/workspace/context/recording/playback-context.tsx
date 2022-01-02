import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import * as React from "react";
import { useCallback, useState } from "react";
import { SchedulerInstance } from "../../../../audio/scheduler";
import {
  useCurrentUserId,
  useCurrentVampId
} from "../../../../util/react-hooks";

export interface CountOff {
  duration: number;
  measures: {
    repetitions: number;
    bpm: number;
    beats: number;
    metronomeSound: string;
  }[];
}

export interface PlaybackContextData {
  playing: boolean;
  playPosition: number;
  loop: boolean;
  recording: boolean;

  /** Calculated bounds of the Vamp, holds beginning and end in seconds. */
  bounds: {
    start: number;
    end: number;
  };

  countingOff: boolean;
  countOffData: CountOff;
  countingOffStartTime: number;

  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  stop: () => void;
  setLoop: (loop: boolean) => void;
  record: () => void;
  stopRecording: () => void;

  setBounds: (bounds: { start: number; end: number }) => void;

  countOff: (recordCountOff: boolean) => void;
  updateCountOff: (update: CountOff) => void;
}

export const defaultPlaybackContext: PlaybackContextData = {
  playing: false,
  playPosition: 0,
  loop: false,
  recording: false,

  bounds: { start: 0, end: 0 },

  countingOff: false,
  countOffData: { duration: 0, measures: [] },
  countingOffStartTime: 0,

  play: () => {},
  pause: () => {},
  seek: () => {},
  stop: () => {},
  setLoop: () => {},
  record: () => {},
  stopRecording: () => {},

  setBounds: () => {},

  countOff: () => {},
  updateCountOff: () => {}
};

export const PlaybackContext = React.createContext<PlaybackContextData>(
  defaultPlaybackContext
);

interface PlaybackProviderProps {
  children: JSX.Element | JSX.Element[];
}

const PLAYBACK_PROVIDER_QUERY = gql`
  query PlaybackProviderQuery($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      cab {
        start
        duration
      }
    }
  }
`;

export const PlaybackProvider: React.FC<PlaybackProviderProps> = ({
  children
}: PlaybackProviderProps) => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const {
    data: {
      userInVamp: { cab }
    }
  } = useQuery(PLAYBACK_PROVIDER_QUERY, {
    variables: { vampId, userId }
  });

  const [playing, setPlaying] = useState(false);
  const [playPosition, setPlayPosition] = useState(0);
  const [loop, setLoop] = useState(true);
  const [recording, setRecording] = useState(false);

  const [bounds, setBounds] = useState<PlaybackContextData["bounds"]>({
    start: 0,
    end: 0
  });

  const [countingOff, setCountingOff] = useState(false);
  const [countOffData, setCountOffData] = useState<CountOff>({
    duration: 0,
    measures: []
  });
  const [countingOffStartTime, setCountingOffStartTime] = useState(0);
  const [countOffTimeout, setCountOffTimeout] = useState<number | undefined>(
    undefined
  );

  const play = useCallback(() => {
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setRecording(false);
    setPlaying(false);
    setPlayPosition(SchedulerInstance.timecode);
  }, []);

  const stop = useCallback(() => {
    setRecording(false);
    setPlaying(false);
    setPlayPosition(cab.start);

    clearTimeout(countOffTimeout);
    setCountOffTimeout(undefined);
  }, [cab.start, countOffTimeout]);

  const seek = useCallback(
    (time: number) => {
      const wasPlaying = playing;
      if (wasPlaying) stop();
      setPlayPosition(time);
      if (wasPlaying) play();
    },
    [play, playing, stop]
  );

  const record = useCallback(() => {
    setPlaying(true);
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setRecording(false);
  }, []);

  const endCountOff = useCallback(() => {
    // Important to setPlaying first.
    setPlaying(true);
    setCountingOff(false);
    setCountingOffStartTime(-1);

    clearTimeout(countOffTimeout);
    setCountOffTimeout(undefined);
  }, [countOffTimeout]);

  const countOff = useCallback(
    (recordCountOff = false) => {
      const startTime = Date.now();

      setRecording(recordCountOff || recording);
      setCountingOff(true);
      setCountingOffStartTime(startTime);

      // NOTE setTimeout isn't very accurate, so we try to handle actual audio
      // scheduling changes below this level (in scheduler.ts). The goal is that
      // this cache update affects only visual UI components, for which higher
      // error is acceptable.
      setCountOffTimeout(
        setTimeout(() => {
          endCountOff();
        }, countOffData.duration * 1000)
      );
    },
    [countOffData.duration, endCountOff, recording]
  );

  const updateCountOff = useCallback(
    (update: Partial<CountOff>) => {
      setCountOffData({ ...countOffData, ...update });
    },
    [countOffData]
  );

  return (
    <PlaybackContext.Provider
      value={{
        playing,
        playPosition,
        loop,
        recording,

        bounds,

        countOffData,
        countingOff,
        countingOffStartTime,

        play,
        pause,
        seek,
        stop,
        setLoop,
        record,
        stopRecording,

        setBounds,

        countOff,
        updateCountOff
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};
