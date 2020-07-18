/*
 * A place for custom React hooks.
 */
import * as React from "react";
import { useQuery } from "react-apollo";
import { gql } from "apollo-boost";
import { useState, useEffect, useRef } from "react";
import { LOCAL_VAMP_ID_CLIENT } from "./state/queries/vamp-queries";
import { TrueTimeClient } from "./state/apollotypes";

// import { audioStore } from "./audio/audio-store";
// import { vampAudioContext } from "./audio/vamp-audio-context";

export const useCurrentVampId = (): string => {
  const { data } = useQuery(LOCAL_VAMP_ID_CLIENT);
  return data.loadedVampId;
};

export const useCurrentUserId = (): string => {
  const { data } = useQuery(gql`
    query GetCurrentUserId {
      me @client {
        id
      }
    }
  `);
  if (data.me == null) {
    return null;
  }
  return data.me.id;
};

// TODO If we end up needing to reuse this functionality it should be put in a
// scripts file somewhere.
/**
 * Basically "what the component state was before the last component state
 * change."
 */
export const usePrevious = <T>(value: T): T => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Returns a state value that can be used to track true time of the play
 * position down to a given accuracy, which is defined by the argument
 * updateFreqMs.
 *
 * Returns true time in seconds.
 */
export const useTrueTime = (updateFreqMs: number): number => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: { start, end, playing, playPosition, playStartTime }
    }
  } = useQuery<TrueTimeClient>(
    gql`
      query TrueTimeClient($vampId: ID!) {
        vamp(id: $vampId) @client {
          playing @client
          playPosition @client
          playStartTime @client
          start @client
          end @client
        }
      }
    `,
    { variables: { vampId } }
  );

  // This "local state" time is initially set to the playPosition from the
  // Apollo Cache.
  const [trueTime, setTrueTime] = useState(playPosition);

  const prev = usePrevious({ playing, playStartTime, playPosition });

  // The [playing] arg makes it so this hook is called when the playing prop
  // changes. If it is, we begin a timeout interval chain which calculates the
  // correct time every 100ms and sets the trueTime state, which is defined
  // above. If it's not playing, we clear the interval so it stops updating and
  // set the true time to the accurate paused value, given by playPosition from
  // the store.
  useEffect(() => {
    let interval: NodeJS.Timeout = null;

    const seek =
      prev &&
      end > start &&
      playing &&
      prev.playing &&
      playStartTime != prev.playStartTime;

    if (seek) {
      clearTimeout(interval);
      setTrueTime(playPosition);
    }

    if (playing) {
      interval = global.setInterval(() => {
        setTrueTime(playPosition + (Date.now() - playStartTime) / 1000);
      }, updateFreqMs);
    } else {
      clearInterval(interval);
      setTrueTime(playPosition);
    }
    return (): void => clearInterval(interval);
  }, [playing, playPosition, playStartTime]);

  return trueTime;
};

export const useHover = (): [React.RefObject<HTMLDivElement>, boolean] => {
  const [value, setValue] = useState(false);

  const ref = React.createRef<HTMLDivElement>();

  const handleMouseOver = (): void => setValue(true);
  const handleMouseOut = (): void => setValue(false);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);

      return (): void => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [ref.current]);

  return [ref, value];
};
