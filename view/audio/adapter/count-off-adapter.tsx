import _ from "underscore";
import React, { useContext, useEffect, useMemo } from "react";
import { usePrevious } from "../../util/react-hooks";
import { SchedulerInstance } from "../scheduler";
import { MetronomeContext } from "../../component/workspace/context/metronome-context";
import {
  CountOff,
  PlaybackContext
} from "../../component/workspace/context/recording/playback-context";

interface CountOffAdapterProps {
  scheduler: typeof SchedulerInstance;
}

/**
 * Listens to changes to the counting off state values and handles making sure
 * the scheduler and other modules do the countoff.
 */
export const CountOffAdapter: React.FC<CountOffAdapterProps> = ({
  scheduler
}: CountOffAdapterProps) => {
  const {
    playPosition,
    updateCountOff,
    countingOff,
    countingOffStartTime
  } = useContext(PlaybackContext);

  const { getMeasureMap } = useContext(MetronomeContext);

  const measureMap = getMeasureMap({
    start: playPosition,
    end: playPosition,
    formIndex: 0
  });

  // An implementation of one of various "strategies" we could use to calculate
  // the countOff. This one in particular finds the measure the playhead is
  // currently in, then gives one of those out front, plus any time into the
  // measure if the playhead isn't at the beginning.
  const calculatedCountOff = useMemo((): CountOff => {
    const measureNos = Object.keys(measureMap).map(Number);

    // Finds the measure that the playhead is currently in.
    const ourMeasureNo = measureNos.find(measureNo => {
      const sec = measureMap[measureNo].section;
      const measureStart = measureMap[measureNo].timeStart;

      return (
        measureStart <= playPosition &&
        playPosition < measureStart + sec.beatsPerBar * (60.0 / sec.bpm)
      );
    });

    const measureStart = measureMap[ourMeasureNo].timeStart;
    const measureSec = measureMap[ourMeasureNo].section;
    const measureDuration = measureSec.beatsPerBar * (60.0 / measureSec.bpm);
    const timeIntoMeasure = playPosition - measureStart;
    const beatsIntoMeasure = Math.ceil(
      (timeIntoMeasure / measureDuration) * measureSec.beatsPerBar
    );

    const leadingMeasure = {
      repetitions: 1,
      bpm: measureSec.bpm,
      beats: measureSec.beatsPerBar,
      metronomeSound: measureSec.metronomeSound
    };
    const extraMeasure = {
      repetitions: 1,
      bpm: measureSec.bpm,
      beats: beatsIntoMeasure,
      metronomeSound: measureSec.metronomeSound
    };

    return {
      duration: measureDuration + timeIntoMeasure,
      measures:
        beatsIntoMeasure === 0
          ? [leadingMeasure]
          : [leadingMeasure, extraMeasure]
    };
  }, [measureMap, playPosition]);

  const prev = usePrevious({
    calculatedCountOff,
    countingOff,
    countingOffStartTime
  });

  // Updates the countOff stored in state if the calculated countOff changes.
  useEffect(() => {
    if (!prev || !_.isEqual(calculatedCountOff, prev.calculatedCountOff)) {
      scheduler.setCountOff(calculatedCountOff);
      updateCountOff(calculatedCountOff);
    }
  }, [calculatedCountOff, prev, scheduler, updateCountOff]);

  // Listens for countingOff to start to begin the scheduler counting off.
  useEffect(() => {
    if (prev) {
      if (countingOff && !prev.countingOff) {
        scheduler.countOff();
      }
    }
  }, [countingOff, prev, scheduler]);

  return null;
};
