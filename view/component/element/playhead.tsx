import * as React from "react";
import * as styles from "./playhead.less";
import { useTrueTime, useCurrentVampId } from "../../react-hooks";
import { PLAYING_CLIENT } from "../../state/queries/vamp-queries";
import { PlayingClient } from "../../state/apollotypes";
import { useQuery } from "@apollo/client";
import { useWorkspaceWidth } from "../../workspace-hooks";

interface PlayheadProps {
  containerStart: number;
}

/**
 * This component is made to be put inside a larger component and will progress
 * along that container using CSS offsets according
 */
const Playhead: React.FC<PlayheadProps> = ({
  containerStart
}: PlayheadProps) => {
  const vampId = useCurrentVampId();
  const trueTime = useTrueTime(100);

  const widthFn = useWorkspaceWidth();

  const playheadWidth = widthFn(trueTime - containerStart);

  const {
    data: {
      vamp: { playing }
    }
  } = useQuery<PlayingClient>(PLAYING_CLIENT, { variables: { vampId } });

  const display = trueTime >= containerStart && playing ? "block" : "none";

  const style = {
    left: `${playheadWidth}px`,
    display
  };

  return <div style={style} className={styles["playhead"]}></div>;
};

export default Playhead;
