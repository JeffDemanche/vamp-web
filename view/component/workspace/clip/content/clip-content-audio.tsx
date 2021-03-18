import * as React from "react";
import * as styles from "./clip-content-audio.less";
import { useWorkspaceWidth } from "../../../../util/workspace-hooks";
import { Oscilloscope } from "../../oscilloscope/oscilloscope";

interface ClipContentAudioProps {
  content: {
    start: number;
    duration: number;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      latencyCompensation: number;
      duration: number;
      error: string | null;
    };
  };
}

export const ClipContentAudio: React.FC<ClipContentAudioProps> = ({
  content
}: ClipContentAudioProps) => {
  const widthFn = useWorkspaceWidth();

  return (
    <div className={styles["content-container"]}>
      <Oscilloscope
        audio={content.audio}
        dimensions={{
          width: widthFn(content.audio.duration)
        }}
      ></Oscilloscope>
    </div>
  );
};
