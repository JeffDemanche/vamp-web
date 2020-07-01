/**
 * This component is present in the WorkspaceAudio component. It's responsible
 * for tracking the true time with a high degree of accuracy and triggering a
 * state update when and if we should loop back to the beginning of the Vamp.
 *
 * Originally this logic was directly inside WorkspaceAudio-audio, but it was
 * causing a lot of lag from how frequently trueTime is updated. Making it a
 * separate component seems to have solve that lag.
 */

import { useEffect } from "react";
import { useMutation } from "react-apollo";
import { useTrueTime } from "../react-hooks";
import { SEEK_CLIENT } from "../queries/vamp-mutations";

interface LooperProps {
  start: number;
  end: number;
  playing: boolean;
  playPosition: number;
  playStartTime: number;
  loop: boolean;
}

const Looper = ({
  start,
  end,
  playing,
  playPosition,
  playStartTime,
  loop
}: LooperProps): JSX.Element => {
  // TODO If there's lag on playback this is a potential source.
  const TIME_UPDATE_FREQ_MS = 5;
  const trueTime = useTrueTime(
    playing,
    playPosition,
    playStartTime,
    start,
    end,
    TIME_UPDATE_FREQ_MS
  );
  const [apolloSeek] = useMutation(SEEK_CLIENT);

  useEffect(() => {
    // Triggers the Apollo mutation that seeks to the beginning of the Vamp when
    // looping is enabled. Once that mutation happens, the next state update
    // should trigger the actual seeking behavior that's defined in
    // vamp-audio.tsx
    if (playing && loop && end > start && trueTime >= end) {
      apolloSeek({ variables: { time: start } });
    }
  }, [trueTime]);

  return null;
};

export default Looper;
