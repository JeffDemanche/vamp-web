import * as React from "react";

import { PlayheadNew } from "./playhead-new";
import { PlayheadRecording } from "./playhead-recording";

/**
 * This component is the root for all playhead types.
 */

interface PlayheadProps {
  empty: boolean;
  recording: boolean;
}

const Playhead: React.FunctionComponent<PlayheadProps> = ({
  empty,
  recording
}) => {
  if (recording) {
    return <PlayheadRecording></PlayheadRecording>;
  } else if (empty) {
    return <PlayheadNew></PlayheadNew>;
  } else {
    return null;
    // TODO other playhead states.
  }
};

export { Playhead };
