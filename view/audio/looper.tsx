/**
 * This component is present in the WorkspaceAudio component. It's responsible
 * for tracking the true time with a high degree of accuracy and triggering a
 * state update when and if we should loop within the Vamp.
 *
 * Originally this logic was directly inside WorkspaceAudio-audio, but it was
 * causing a lot of lag from how frequently trueTime is updated. Making it a
 * separate component seems to have solve that lag.
 */

import { useEffect } from "react";
import { useMutation, useQuery } from "react-apollo";
import {
  useTrueTime,
  useCurrentVampId,
  useCurrentUserId
} from "../react-hooks";
import { SEEK_CLIENT } from "../state/queries/vamp-mutations";
import gql from "graphql-tag";
import { CabClient } from "../state/apollotypes";
import { CAB_CLIENT } from "../state/queries/user-in-vamp-queries";

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
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const { data, loading } = useQuery<CabClient>(CAB_CLIENT, {
    variables: { vampId, userId }
  });

  const {
    userInVamp: { cab }
  } = data || { userInVamp: { cab: { start, duration: end - start } } };

  // TODO If there's lag on playback this is a potential source.
  const TIME_UPDATE_FREQ_MS = 5;
  const trueTime = useTrueTime(TIME_UPDATE_FREQ_MS);
  const [apolloSeek] = useMutation(SEEK_CLIENT);

  // TODO We can update these to enable/disable looping in the cab.
  const realStart = cab.start;
  const realEnd = cab.start + cab.duration;

  useEffect(() => {
    // Triggers the Apollo mutation that seeks to the beginning of the Vamp when
    // looping is enabled. Once that mutation happens, the next state update
    // should trigger the actual seeking behavior that's defined in
    // vamp-audio.tsx
    if (playing && loop && realEnd > realStart && trueTime >= realEnd) {
      apolloSeek({ variables: { time: realStart } });
    }
  }, [trueTime]);

  return null;
};

export default Looper;
