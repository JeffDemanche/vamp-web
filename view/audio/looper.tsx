/**
 * This component is present in the WorkspaceAudio component. It's responsible
 * for tracking the true time with a high degree of accuracy and triggering a
 * state update when and if we should loop within the Vamp.
 *
 * Originally this logic was directly inside WorkspaceAudio-audio, but it was
 * causing a lot of lag from how frequently trueTime is updated. Making it a
 * separate component seems to have solve that lag.
 */

import { useContext, useEffect } from "react";
import { useTrueTime, useCurrentVampId } from "../util/react-hooks";
import { useIsEmpty } from "../util/workspace-hooks";
import { useCabLoops } from "../component/workspace/hooks/use-cab-loops";
import { PlaybackContext } from "../component/workspace/context/recording/playback-context";

interface LooperProps {
  start: number;
  end: number;
  playing: boolean;
}

const Looper = ({ start, end, playing }: LooperProps): JSX.Element => {
  const vampId = useCurrentVampId();

  const { seek: apolloSeek } = useContext(PlaybackContext);

  // If empty we render in the "new Vamp" layout.
  const empty = useIsEmpty(vampId);

  const cabLoops = useCabLoops();

  // TODO If there's lag on playback this is a potential source.
  const TIME_UPDATE_FREQ_MS = 5;
  const trueTime = useTrueTime(TIME_UPDATE_FREQ_MS);

  useEffect(() => {
    // Triggers the Apollo mutation that seeks to the beginning of the Vamp when
    // looping is enabled. Once that mutation happens, the next state update
    // should trigger the actual seeking behavior that's defined in
    // vamp-audio.tsx
    if (playing && cabLoops && end > start && trueTime >= end && !empty) {
      apolloSeek(start);
    }
  }, [trueTime]);

  return null;
};

export default Looper;
