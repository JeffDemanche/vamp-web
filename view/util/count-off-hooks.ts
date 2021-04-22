import { gql, useApolloClient, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import {
  CountOffReverseCounterQuery,
  GetVamp_vamp_countOff
} from "../state/apollotypes";
import { useCurrentVampId } from "./react-hooks";

export interface CountOff {
  duration: number;
  measures: {
    repetitions: number;
    bpm: number;
    beats: number;
    metronomeSound: string;
  }[];
}

/**
 * Returns a function that can update the cache to change the countOff settings.
 * Should be called on seek, etc.
 */
export const useUpdateCountOff = (): ((update: CountOff) => void) => {
  const { cache } = useApolloClient();
  const vampId = useCurrentVampId();

  return (update: CountOff): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: vampId }),
      fields: {
        countOff: (): GetVamp_vamp_countOff => ({
          __typename: "CountOff",
          duration: update.duration,
          measures: update.measures.map(measure => ({
            __typename: "CountOffMeasure",
            ...measure
          }))
        })
      }
    });
  };
};

export const useCountOffReverseCounter = (): number => {
  const vampId = useCurrentVampId();

  const {
    data: {
      vamp: {
        countingOffStartTime,
        countOff: { measures }
      }
    }
  } = useQuery<CountOffReverseCounterQuery>(
    gql`
      query CountOffReverseCounterQuery($vampId: ID!) {
        vamp(id: $vampId) @client {
          countingOffStartTime
          countOff {
            measures {
              repetitions
              beats
              bpm
            }
          }
        }
      }
    `,
    { variables: { vampId } }
  );

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
