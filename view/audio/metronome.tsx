import { Scheduler } from "./scheduler";
import { useEffect, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import { MetronomeClient } from "../state/apollotypes";
import { useCurrentVampId } from "../react-hooks";

interface MetronomeProps {
  audioContext: AudioContext;
  scheduler: Scheduler;
}

const METRONOME_CLIENT = gql`
  query MetronomeClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      bpm @client
      beatsPerBar @client
      playing @client
      metronomeSound @client
      playPosition @client
      playStartTime @client
    }
  }
`;

const Metronome = ({
  audioContext,
  scheduler
}: MetronomeProps): JSX.Element => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: {
        bpm,
        beatsPerBar,
        playing,
        metronomeSound,
        playPosition,
        playStartTime
      }
    }
  } = useQuery<MetronomeClient>(METRONOME_CLIENT, { variables: { vampId } });

  const timeBetweenTicks = (): number => 1.0 / (bpm / 60);

  const tick = (context: AudioContext): AudioScheduledSourceNode => {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.connect(context.destination);
    osc.start(0);
    osc.stop(context.currentTime + 0.05);
    return osc;
  };

  const setEvent = (): void => {
    scheduler.addEvent({
      id: "METRONOME",
      start: 0,
      dispatch: async (
        context: AudioContext
      ): Promise<AudioScheduledSourceNode | void> => {
        if (playing) {
          return tick(context);
        }
      },
      repeat: timeBetweenTicks()
    });
  };

  const play = async (): Promise<void> => {
    setEvent();
  };

  const usePrevious = <T,>(value: T): T => {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevData = usePrevious({ playing, bpm, beatsPerBar });

  useEffect(() => {
    if (prevData) {
      if (playing && !prevData.playing) {
        play();
      }
      if (bpm != prevData.bpm || beatsPerBar != prevData.beatsPerBar) {
        setEvent();
      }
    }
  });

  return null;
};

export default Metronome;
