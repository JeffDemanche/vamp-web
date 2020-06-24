import { Scheduler } from "./scheduler";
import { useEffect, useRef } from "react";
import { ChildProps, graphql } from "react-apollo";
import { gql } from "apollo-boost";

interface MetronomeData {
  bpm: number;
  beatsPerBar: number;
  playing: boolean;
  metronomeSound: string;
  playPosition: number;
  playStartTime: number;
}

interface OwnProps {
  audioContext: AudioContext;
  scheduler: Scheduler;
}

type MetronomeProps = MetronomeData & OwnProps;

const ConnectedMetronome = ({
  audioContext,
  scheduler,
  data: {
    bpm,
    beatsPerBar,
    playing,
    metronomeSound,
    playPosition,
    playStartTime
  }
}: ChildProps<OwnProps, MetronomeData>): JSX.Element => {
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

const METRONOME_QUERY = gql`
  query MetronomeData {
    bpm @client
    beatsPerBar @client
    playing @client
    metronomeSound @client
    playPosition @client
    playStartTime @client
  }
`;

const Metronome = graphql<OwnProps, MetronomeData>(METRONOME_QUERY)(
  ConnectedMetronome
);

export default Metronome;
