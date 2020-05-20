import * as React from "react";

import { useState } from "react";

import { PlayheadNew } from "./playhead-new";
import { PlayheadRecording } from "./playhead-recording";

/**
 * This component is the root for all playhead types.
 */

type PlayheadState = "new" | "recording";

interface PlayheadProps {
  initialState: PlayheadState;
}

const Playhead: React.FunctionComponent<PlayheadProps> = ({
  initialState
}: PlayheadProps) => {
  const [playheadState, setPlayheadState] = useState<PlayheadState>(
    initialState
  );

  switch (playheadState) {
    case "new":
      return <PlayheadNew></PlayheadNew>;
    case "recording":
      return <PlayheadRecording></PlayheadRecording>;
  }
};

export { Playhead };
