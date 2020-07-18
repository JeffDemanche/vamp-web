import * as React from "react";

import styles = require("./clip.less");
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import { useWorkspaceWidth } from "../../../workspace-hooks";
import Playhead from "../../element/playhead";

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

  const opacity = clip.audio.storedLocally ? 1.0 : 0.7;

  const synced = clip.audio.filename !== "" ? "" : "not synced";

  const width = widthFn(clip.audio.duration);

  return (
    <div className={styles["clip"]} style={{ width, opacity }}>
      <Playhead
        containerStart={clip.start}
        containerDuration={clip.audio.duration}
      />
      <Oscilloscope
        audio={clip.audio}
        dimensions={{
          height: 150,
          width: widthFn(clip.audio.duration)
        }}
      ></Oscilloscope>
      {synced}
    </div>
  );
};

export default Clip;
