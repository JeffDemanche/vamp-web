import { configure, GlobalHotKeys } from "react-hotkeys";
import * as React from "react";
import { useQuery } from "@apollo/client";
import {
  PLAYING_CLIENT,
  RECORDING_CLIENT
} from "../../state/queries/vamp-queries";
import { PlayingClient, RecordingClient } from "../../state/apollotypes";
import { useCurrentVampId } from "../../util/react-hooks";
import {
  usePause,
  usePlay,
  useRecord,
  useSeek,
  useSetFloorOpen,
  useStop
} from "../../state/vamp-state-hooks";
import { useEffect } from "react";

interface HotKeysTypes {
  children: React.ReactNode;
}

export const HotKeysWrapper: React.FC<HotKeysTypes> = (
  props: HotKeysTypes
): JSX.Element => {
  const vampId = useCurrentVampId();

  useEffect(() => {
    configure({ allowCombinationSubmatches: true });
  }, []);

  const keyMap = {
    PLAY_STOP: "space",
    PAUSE: "shift+space",
    RECORD: "r",
    MUSICAL_TYPING: "cmd+k",
    TOGGLE_FLOOR: "shift+f"
  };

  const play = usePlay();
  const pause = usePause();
  const stop = useStop();
  const record = useRecord();
  const seek = useSeek();
  const setFloorOpen = useSetFloorOpen();

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
          seek(0);
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
    },
    TOGGLE_FLOOR: (): void => {
      setFloorOpen();
    }
  };
  return (
    <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges={true}>
      {props.children}
    </GlobalHotKeys>
  );
};
