import * as React from "react";
import * as styles from "./clip-content-audio.less";
import classNames from "classnames";
import { useWorkspaceWidth } from "../../../../util/workspace-hooks";
import { useWaveformSVG } from "../../../../audio/waveform/waveform-hooks";
import { useMemo } from "react";

interface ClipContentAudioProps {
  content: {
    start: number;
    duration: number;
    offset: number;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
      error: string | null;
    };
  };
  hoveringClip: boolean;
  index: number;
  total: number;
}

export const ClipContentAudio: React.FC<ClipContentAudioProps> = ({
  content,
  hoveringClip,
  index,
  total
}: ClipContentAudioProps) => {
  const { svg } = useWaveformSVG(content.audio.id, 1);

  const widthFn = useWorkspaceWidth();

  const width = widthFn(content.duration);
  const left = widthFn(content.start);

  const wfCropLeft = widthFn(content.offset);
  const wfCropRight = widthFn(
    content.audio.duration - (content.duration + content.offset)
  );

  const topPctNotHovered = useMemo(() => 10 + (index * 80.0) / total, [
    index,
    total
  ]);
  const heightPctNotHovered = useMemo(() => 80.0 / total, [total]);

  const topPct = hoveringClip ? topPctNotHovered : 10;
  const heightPct = hoveringClip ? heightPctNotHovered : 80;

  return (
    <div
      className={classNames(styles["content-container"], {
        [styles["singleLane"]]: !hoveringClip
      })}
      style={{ width, left, top: `${topPct}%`, height: `${heightPct}%` }}
    >
      <div
        className={styles["waveform-container"]}
        style={{ left: `-${wfCropLeft}px`, right: `-${wfCropRight}px` }}
      >
        {svg}
      </div>
      <div className={styles["content-border-box"]}></div>
    </div>
  );
};
