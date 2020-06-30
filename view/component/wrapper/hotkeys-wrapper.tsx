import { GlobalHotKeys } from "react-hotkeys";
import * as React from "react";
import { useMutation, useQuery } from "react-apollo";
import { PLAY, PAUSE, STOP, RECORD, SEEK } from "../../state/mutations";
import { PLAYING } from "../../state/queries";
import { gql } from "apollo-boost";
import { useEffect } from "react";

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

  const [play] = useMutation(PLAY);
  const [pause] = useMutation(PAUSE);
  const [stop] = useMutation(STOP);
  const [record] = useMutation(RECORD);
  const [seek] = useMutation(SEEK);

  const { data, loading, error } = useQuery(PLAYING);
  const { data: recordingData } = useQuery(RECORDING);

  const handlers = {
    PLAY_STOP: (): void => {
      const isPlaying = data.playing;
      if (isPlaying) {
        if (recordingData.recording) {
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
