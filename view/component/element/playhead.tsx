import * as React from "react";
import * as styles from "./playhead.less";
import { useTrueTime, useCurrentVampId } from "../../util/react-hooks";
import { PLAYING_CLIENT } from "../../state/queries/vamp-queries";
import { PlayingClient } from "../../state/apollotypes";
import { useQuery } from "@apollo/client";
import { useWorkspaceWidth } from "../../util/workspace-hooks";

interface PlayheadProps {
  containerStart: number;
  containerDuration?: number;
}

/**
 * This component is made to be put inside a larger component and will progress
 * along that container using CSS offsets according
 */
const Playhead: React.FC<PlayheadProps> = ({
  containerStart,
  containerDuration
}: PlayheadProps) => {
  const vampId = useCurrentVampId();
  const trueTime = useTrueTime(100);

  const widthFn = useWorkspaceWidth();

  const playheadRelativeLeft = widthFn(trueTime - containerStart);

  const {
    data: {
      vamp: { playing }
    }
  } = useQuery<PlayingClient>(PLAYING_CLIENT, { variables: { vampId } });

  const shouldRender =
    containerDuration === undefined ||
    (containerStart + containerDuration > trueTime &&
      containerStart < trueTime);
  if (!shouldRender) return null;

  const display = trueTime >= containerStart && playing ? "block" : "none";

  const style = {
    left: `${playheadRelativeLeft}px`,
    display
  };

  return <div style={style} className={styles["playhead"]}></div>;
};

export default Playhead;
