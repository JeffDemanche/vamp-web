import { configure, GlobalHotKeys } from "react-hotkeys";
import * as React from "react";
import { useSetFloorOpen } from "../../util/vamp-state-hooks";
import { useContext, useEffect } from "react";
import { PlaybackContext } from "../workspace/context/recording/playback-context";

interface HotKeysTypes {
  children: React.ReactNode;
}

export const HotKeysWrapper: React.FC<HotKeysTypes> = (
  props: HotKeysTypes
): JSX.Element => {
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

  const { playing, recording, play, stop, seek } = useContext(PlaybackContext);

  const setFloorOpen = useSetFloorOpen();

  const handlers = {
    PLAY_STOP: (): void => {
      const isPlaying = playing;
      if (isPlaying) {
        if (recording) {
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
