import * as React from "react";

import styles = require("./clip.less");
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import { useWorkspaceWidth } from "../../../workspace-hooks";

interface ClipProps {
  clip: {
    id: string;
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

  return (
    <div
      className={styles["clip"]}
      style={{ width: widthFn(clip.audio.duration), opacity: opacity }}
    >
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
