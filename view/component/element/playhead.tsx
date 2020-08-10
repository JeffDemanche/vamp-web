import * as React from "react";
import * as styles from "./playhead.less";
import { useTrueTime, useCurrentVampId } from "../../react-hooks";
import { PLAYING_CLIENT } from "../../state/queries/vamp-queries";
import { PlayingClient } from "../../state/apollotypes";
import { useQuery } from "react-apollo";
import { play } from "../../redux/actions/workspace";

interface PlayheadProps {
  containerStart: number;
  containerDuration: number;
}

/**
 * This component is made to be put inside a larger component and will progress
 * along that container using CSS percent when the Vamp is being played,
 * according to the true time.
 */
const Playhead: React.FC<PlayheadProps> = ({
  containerStart,
  containerDuration
}: PlayheadProps) => {
  const vampId = useCurrentVampId();
  const trueTime = useTrueTime(100);

  const {
    data: {
      vamp: { playing }
    }
  } = useQuery<PlayingClient>(PLAYING_CLIENT, { variables: { vampId } });

  const percent = (100.0 * (trueTime - containerStart)) / containerDuration;
  const clampedPercent = Math.min(100.0, Math.max(0.0, percent));
  const display =
    clampedPercent != 0.0 && clampedPercent != 100.0 && playing
      ? "block"
      : "none";

  const style = {
    left: `${clampedPercent}%`,
    display
  };

  return <div style={style} className={styles["playhead"]}></div>;
};

export default Playhead;
