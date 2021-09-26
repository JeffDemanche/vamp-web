import React, { useCallback, useContext, useEffect } from "react";
import { PlaybackContext } from "../../component/workspace/context/recording/playback-context";
import { usePrevious } from "../../util/react-hooks";
import { SchedulerInstance } from "../scheduler";

interface PlayStopAdapterProps {
  scheduler: typeof SchedulerInstance;
}

/**
 * Handles reading from state to play, stop, pause, etc. the scheduler.
 */
export const PlayStopAdapter: React.FC<PlayStopAdapterProps> = ({
  scheduler
}: PlayStopAdapterProps) => {
  const { playing, countingOff } = useContext(PlaybackContext);

  const prevData = usePrevious({ playing, countingOff });

  const play = useCallback((): void => {
    scheduler.play();
  }, [scheduler]);

  const stop = useCallback((): void => {
    scheduler.stop();
  }, [scheduler]);

  useEffect(() => {
    if (prevData) {
      // When countingOff was true, the scheduler count off sequent handles
      // playback automatically (for timing reasons) and we don't need to do it
      // from here.
      if (!prevData.countingOff && !countingOff) {
        if (playing && !prevData.playing) {
          play();
        }
      }
      if (!playing && prevData.playing) {
        stop();
      }
    }
  }, [countingOff, play, playing, prevData, stop]);

  return null;
};
