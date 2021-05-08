import * as React from "react";
import * as styles from "./clip-content-audio.less";
import { useWorkspaceWidth } from "../../../../util/workspace-hooks";
import { useWaveformSVG } from "../../../../audio/waveform/waveform-hooks";

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
  const { svg } = useWaveformSVG(content.audio.id, 1);

  const widthFn = useWorkspaceWidth();

  const width = widthFn(content.audio.duration);
  const left = widthFn(content.start - content.audio.latencyCompensation);

  return (
    <div className={styles["content-container"]} style={{ width, left }}>
      {svg}
      <div className={styles["content-border-box"]}></div>
    </div>
  );
};
