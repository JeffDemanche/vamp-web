import * as React from "react";
import * as styles from "./playhead.less";
import { useTrueTime } from "../../util/react-hooks";
import { useWorkspaceWidth } from "../../util/workspace-hooks";
import { PlaybackContext } from "../workspace/context/recording/playback-context";
import { useContext } from "react";

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
  const trueTime = useTrueTime(100);

  const widthFn = useWorkspaceWidth();

  const playheadRelativeLeft = widthFn(trueTime - containerStart);

  const { playing } = useContext(PlaybackContext);

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
