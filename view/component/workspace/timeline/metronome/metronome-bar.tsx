import * as React from "react";
import * as styles from "./metronome-bar.less";
import { useQuery } from "react-apollo";
import { METRONOME_INFO_CLIENT } from "../../../../state/queries/vamp-queries";
import { MetronomeInfoClient } from "../../../../state/apollotypes";
import { useCurrentVampId } from "../../../../react-hooks";
import {
  useWorkspaceWidth,
  useWindowDimensions,
  useWorkspaceLeft,
  useViewBounds
} from "../../../../workspace-hooks";

interface MetronomeMeasureProps {
  measureNo: number;
  beats: number;
  bpm: number;
  hidden: boolean;
  widthFn: (duration: number) => number;
  leftFn: (time: number) => number;
}

/**
 * Used to decide whether to hide measure numbers for a given measure in a
 * compact view.
 */
const displayMeasureNo = (measureWidth: number, measureNo: number): boolean => {
  if (measureWidth < 50) {
    return Math.abs(measureNo) % 2 == 0;
  } else {
    return true;
  }
};

const MetronomeMeasure: React.FC<MetronomeMeasureProps> = ({
  measureNo,
  beats,
  bpm,
  hidden,
  widthFn,
  leftFn
}: MetronomeMeasureProps) => {
  const beatDuration = 60.0 / bpm;

  // Seconds long
  const duration = beatDuration * beats;

  // Pixel width given view state
  const measureWidth = widthFn(duration);

  const beatWidth = widthFn(beatDuration);

  const measureLeft = leftFn(measureNo * duration);

  const markers = Array.from({ length: beats }, (value, key) => {
    if (key > 0)
      return (
        <div
          key={key}
          // Minus 4 to correctly offset for the padding we add
          style={{ left: key * beatWidth - 4 }}
          className={styles["beat-marker"]}
        ></div>
      );
  });

  const opacity = hidden ? 0.6 : 1;

  if (measureWidth > 100) {
    return (
      <div
        style={{ width: measureWidth, left: measureLeft, opacity }}
        className={styles["measure-container"]}
      >
        <div className={styles["measure"]}>
          <span className={styles["measure-no"]}>{measureNo}.</span>
          {markers}
        </div>
      </div>
    );
  } else {
    const measureLabel = displayMeasureNo(measureWidth, measureNo) ? (
      <>{measureNo}.</>
    ) : null;
    return (
      <div
        style={{ width: measureWidth, left: measureLeft, opacity }}
        className={styles["measure-compact"]}
      >
        <span className={styles["measure-no"]}>{measureLabel}</span>
        <div className={styles["beat-marker"]}></div>
      </div>
    );
  }
};

const MetronomeBar: React.FC = () => {
  const vampId = useCurrentVampId();

  const widthFn = useWorkspaceWidth();
  const leftFn = useWorkspaceLeft();

  const { start, end } = useViewBounds();

  // TODO we will eventually have the ability to insert custom measure lengths,
  // time changes, etc.
  const {
    data: {
      vamp: { bpm, beatsPerBar }
    }
  } = useQuery<MetronomeInfoClient>(METRONOME_INFO_CLIENT, {
    variables: { vampId }
  });

  const { width: windowWidth } = useWindowDimensions();
  const metronomeDrawRange = windowWidth * 2;
  const measureDuration = (60.0 / bpm) * beatsPerBar;
  const measureWidth = widthFn((60.0 / bpm) * beatsPerBar);
  const numMeaures = Math.floor(metronomeDrawRange / measureWidth);

  const positiveMeasures = Array.from({ length: numMeaures }, (value, key) => {
    const measureNo = key - Math.floor(numMeaures / 2);
    // TODO
    const measureStart = measureNo * measureDuration;
    const measureEnd = measureStart + measureDuration;
    const hidden = measureEnd <= start || measureStart >= end;
    return (
      <MetronomeMeasure
        key={key}
        measureNo={measureNo}
        beats={beatsPerBar}
        bpm={bpm}
        hidden={hidden}
        widthFn={widthFn}
        leftFn={leftFn}
      />
    );
  });

  return <div className={styles["metronome-bar"]}>{positiveMeasures}</div>;
};

export default MetronomeBar;
