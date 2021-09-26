import { useContext, useEffect, useMemo, useState } from "react";
import { PlaybackContext } from "./playback-context";

export const useCountOffReverseCounter = (): number => {
  const {
    countingOffStartTime,
    countOffData: { measures }
  } = useContext(PlaybackContext);

  const [interval, setInterval] = useState(null);

  const [timeDiff, setTimeDiff] = useState(0);

  const [currentBeat, setCurrentBeat] = useState(0);

  // An array of beats in order, mapped to start time in seconds
  const beats = useMemo(() => {
    const beatsArray: { startTime: number }[] = [];

    let measureStartTimeAcc = 0;

    measures.forEach(m => {
      for (let r = 0; r < m.repetitions; r++) {
        for (let b = 0; b < m.beats; b++) {
          const beatTimeInMeasure = (60.0 / m.bpm) * b;
          beatsArray.push({
            startTime: measureStartTimeAcc + beatTimeInMeasure
          });
        }
        // Increment by measure duration
        measureStartTimeAcc += (60.0 / m.bpm) * m.beats;
      }
    });

    return beatsArray;
  }, [measures]);

  // Clears interval on component unmount
  useEffect(() => {
    return (): void => global.clearInterval(interval);
  }, [interval]);

  // Sets a state timer
  useEffect(() => {
    setInterval(
      global.setInterval(() => {
        const timeDiff = (Date.now() - countingOffStartTime) / 1000.0;
        setTimeDiff(timeDiff);
      }, 100)
    );
  }, [countingOffStartTime]);

  // Uses the state timer to update the current beat.
  useEffect(() => {
    if (beats[currentBeat + 1] && timeDiff > beats[currentBeat + 1].startTime) {
      setCurrentBeat(currentBeat + 1);
    }
  }, [beats, currentBeat, timeDiff]);

  return beats.length - currentBeat;
};
