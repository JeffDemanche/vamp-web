import * as React from "react";

import styles = require("./clip.less");
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import { useWorkspaceWidth, useWorkspaceLeft } from "../../../workspace-hooks";
import Playhead from "../../element/playhead";
import { VampButton } from "../../element/button";
import TrashButton from "./trash-button";
import { useEffect, useRef } from "react";

interface ClipProps {
  clip: {
    id: string;
    start: number;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
    };
  };
}

const Clip: React.FunctionComponent<ClipProps> = ({ clip }: ClipProps) => {
  const widthFn = useWorkspaceWidth();
  const leftFn = useWorkspaceLeft();

  const opacity = clip.audio.storedLocally ? 1.0 : 0.7;

  const synced = clip.audio.filename !== "" ? "" : "not synced";

  const left = leftFn(clip.start);
  const width = widthFn(clip.audio.duration);

  return (
    <div className={styles["clip"]} style={{ left, width, opacity }}>
      <div className={styles["display-on-hover"]}>
        <TrashButton clipId={clip.id}></TrashButton>
      </div>
      <Playhead
        containerStart={clip.start}
        containerDuration={clip.audio.duration}
      />
      <Oscilloscope
        audio={clip.audio}
        dimensions={{
          width: width
        }}
      ></Oscilloscope>
      {synced}
    </div>
  );
};

export default Clip;
