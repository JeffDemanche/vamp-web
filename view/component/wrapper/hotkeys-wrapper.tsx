import { GlobalHotKeys } from "react-hotkeys";
import * as React from "react";
import { useMutation, useQuery } from "react-apollo";
import { gql } from "apollo-boost";
import {
  PLAY_CLIENT,
  PAUSE_CLIENT,
  STOP_CLIENT,
  RECORD_CLIENT,
  SEEK_CLIENT
} from "../../queries/vamp-mutations";
import { PLAYING_CLIENT, RECORDING_CLIENT } from "../../queries/vamp-queries";
import {
  PlayClient,
  StopClient,
  RecordClient,
  Seek,
  PauseClient,
  PlayingClient,
  RecordingClient
} from "../../state/apollotypes";

export interface ToWrapTypes {
  children: React.ReactNode;
}

export const HotKeysWrapper: React.FC<ToWrapTypes> = (
  props: ToWrapTypes
): JSX.Element => {
  const RECORDING = gql`
    query Recording {
      recording @client
    }
  `;
  const keyMap = {
    PLAY_STOP: "space",
    PAUSE: "shift+space",
    RECORD: "r",
    MUSICAL_TYPING: "cmd+k"
  };

  const [play] = useMutation<PlayClient>(PLAY_CLIENT);
  const [pause] = useMutation<PauseClient>(PAUSE_CLIENT);
  const [stop] = useMutation<StopClient>(STOP_CLIENT);
  const [record] = useMutation<RecordClient>(RECORD_CLIENT);
  const [seek] = useMutation<Seek>(SEEK_CLIENT);

  const { data, loading, error } = useQuery<PlayingClient>(PLAYING_CLIENT);
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT);

  const handlers = {
    PLAY_STOP: (): void => {
      const isPlaying = data.vamp.playing;
      if (isPlaying) {
        if (recordingData.vamp.recording) {
          seek({ variables: { time: 0 } });
        } else {
          stop();
        }
      } else {
        play();
      }
    },
    STOP: (): void => {
      stop();
    },
    PAUSE: (): void => {
      // TODO: I don't know how pause should work
      pause();
    },
    RECORD: (): void => {
      // TODO: I don't know how record should work
      record();
    },
    MUSICAL_TYPING: (): void => {
      console.log("musical typing!");
    }
  };
  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges={true}>
      {props.children}
    </GlobalHotKeys>
  );
};
