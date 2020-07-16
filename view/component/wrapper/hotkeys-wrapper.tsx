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
} from "../../state/queries/vamp-mutations";
import {
  PLAYING_CLIENT,
  RECORDING_CLIENT
} from "../../state/queries/vamp-queries";
import {
  PlayClient,
  StopClient,
  RecordClient,
  Seek,
  PauseClient,
  PlayingClient,
  RecordingClient
} from "../../state/apollotypes";
import { useCurrentVampId } from "../../react-hooks";

interface HotKeysTypes {
  children: React.ReactNode;
}

export const HotKeysWrapper: React.FC<HotKeysTypes> = (
  props: HotKeysTypes
): JSX.Element => {
  const vampId = useCurrentVampId();

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

  const { data, loading, error } = useQuery<PlayingClient>(PLAYING_CLIENT, {
    variables: { vampId }
  });
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });

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

    PAUSE: (): void => {
      // TODO: I don't know how pause should work
      // pause();
      console.log("pause!");
    },
    RECORD: (): void => {
      // TODO: I don't know how record should work
      // record();
      console.log("record!");
    },
    MUSICAL_TYPING: (): void => {
      // TODO: we haven't implemented this yet, but I use it a lot in logic
      console.log("musical typing!");
    }
  };
  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges={true}>
      {props.children}
    </GlobalHotKeys>
  );
};
