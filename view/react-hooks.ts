/*
 * A place for custom React hooks.
 */
import * as React from "react";
import * as io from "socket.io-client";
import * as Peer from "simple-peer";
import { gql, useQuery } from "@apollo/client";
import { useState, useEffect, useRef } from "react";

import { LOCAL_VAMP_ID_CLIENT } from "./state/queries/vamp-queries";
import { TrueTimeClient } from "./state/apollotypes";
import { audioStore } from "./audio/audio-store";
import { vampAudioContext } from "./audio/vamp-audio-context";
import { vampAudioStream } from "./audio/vamp-audio-stream";
import { loadedVampIdVar } from "./state/cache";

export const useCurrentVampId = (): string => {
  return loadedVampIdVar();
};

export const useCurrentUserId = (): string => {
  const { data } = useQuery(
    gql`
      query GetCurrentUserId {
        me {
          id
        }
      }
    `,
    { fetchPolicy: "cache-first" }
  );
  if (!data || data.me == null) {
    return null;
  }
  return data.me.id;
};

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

// Grabs the stored auido from audio store
export const useStoredAudio = (id: string): Float32Array => {
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array());
  const fileBuffer = audioStore.getStoredAudio(id);

  // Use stored audio
  useEffect(() => {
    if (fileBuffer) {
      fileBuffer.data.arrayBuffer().then(arrayBuffer => {
        const audioBuffer = vampAudioContext
          .getAudioContext()
          .decodeAudioData(arrayBuffer);
        audioBuffer.then(audioBuffer => {
          setAudioData(audioBuffer.getChannelData(0));
        });
      });
    }
  }, [fileBuffer]);

  return audioData;
};

const Float32Concat = (
  first: Float32Array,
  second: Float32Array
): Float32Array => {
  const firstLength = first.length,
    result = new Float32Array(firstLength + second.length);

  result.set(first);
  result.set(second, firstLength);

  return result;
};

// If there's no stored audio, we use the user's mic stream and animate
export const useStreamedAudio = (): Float32Array => {
  const context = vampAudioContext.getAudioContext();
  let stream: MediaStream;
  let data: Float32Array;
  let source: MediaStreamAudioSourceNode;
  let analyser: AnalyserNode;

  const requestRef = useRef<number>(null);
  const previousTimeRef = useRef<number>(null);
  const audioDataRef = useRef<Float32Array>(new Float32Array());

  const update = (time: number): void => {
    const audioData = audioDataRef.current;
    if (previousTimeRef.current != undefined) {
      data = new Float32Array(analyser.fftSize);
      // Copy new values into the blank data array
      analyser.getFloatTimeDomainData(data);
      audioDataRef.current = Float32Concat(audioData, data);
    }
    const rate = 100;
    setTimeout(() => {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(update);
    }, rate);
  };

  useEffect(() => {
    vampAudioStream
      .getAudioStream()
      .then(res => (stream = res))
      .then(() => {
        source = context.createMediaStreamSource(stream);
        analyser = context.createAnalyser();
        source.connect(analyser);
      })
      .then(() => {
        requestRef.current = requestAnimationFrame(update);
        return (): void => cancelAnimationFrame(requestRef.current);
      })
      .catch(() => {
        // Tell the user they need to enable their mic manually
        vampAudioStream.sendAlert();
      });
  }, []);

  return audioDataRef.current;
};

/*
  Hook for web rtc + socket io, returns an array of peer 
  instances, each of which has a media stream accessible from the 
  following pattern, for example:

      useEffect(() => {
        // Add the stream from other user's in the user's
        peer.on("stream", (stream: MediaStream) => {
          //do something with the stream
        });
      }, []);
  
  For video chat (for example), we make a ref connect to the stream 
  and use that ref in the <video /> tag
*/
export const usePeers = (streamType?: string): Peer.Instance[] => {
  let stream: MediaStream;
  switch (streamType) {
    case "audio": {
      vampAudioStream
        .getAudioStream()
        .then(res => (stream = res))
        .catch(() => {
          vampAudioStream.sendAlert();
        });
      break;
    }
    // case "video": {
    //   stream = vampVideoStream.getVideoStream();
    //   break;
    // }
    default:
      vampAudioStream
        .getAudioStream()
        .then(res => (stream = res))
        .catch(() => {
          vampAudioStream.sendAlert();
        });
      break;
    // TODO: any other p2p data we want to send
  }

  const vampId = useCurrentVampId();
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const socketRef = useRef<SocketIOClient.Socket>(null);
  const userStream = useRef<MediaStream>(null);
  const peersRef = useRef([]);

  const createPeer = (
    userToSignal: any,
    callerID: string,
    stream: MediaStream
  ): Peer.Instance => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });
    peer.on("signal", signal => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal
      });
    });
    return peer;
  };

  const addPeer = (
    incomingSignal: string | Peer.SignalData,
    callerID: string,
    stream: MediaStream
  ): Peer.Instance => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });
    peer.on("signal", signal => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });
    peer.signal(incomingSignal);
    return peer;
  };

  // TODO: Might have to change because vamp stream result is now a promise again
  useEffect(() => {
    socketRef.current = io.connect("/");
    userStream.current = stream;
    socketRef.current.emit("join vamp", vampId);
    socketRef.current.on("all users", (users: string[]) => {
      users.forEach((userId: string) => {
        const peer = createPeer(userId, socketRef.current.id, stream);
        peersRef.current.push({
          peerID: userId,
          peer
        });
        peers.push(peer);
      });
      setPeers(peers);
    });
    socketRef.current.on("user joined", (payload: any) => {
      const item = peersRef.current.find(p => p.peerID === payload.callerID);
      if (!item) {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer
        });
        setPeers(users => [...users, peer]);
      }
    });
    socketRef.current.on("receiving returned signal", (payload: any) => {
      const item = peersRef.current.find(p => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });
  }, []);

  return peers;
};

/**
 * Scroll events are hard because different mouses/input devices can send them
 * at different rates. This hook accumulates scroll distance over `timer`
 * millisecond chunks of time, and dispatches `onWheel` at the end of each
 * chunk. It returns an event function that can be passed into a component's
 * `onWheel` event.
 */
export const useScrollTimeout = (
  onWheel: (dist: number, lastEvent: React.WheelEvent) => void,
  timer: number
): ((e: React.WheelEvent) => void) => {
  const [dist, setDist] = useState<number>(0);

  const [chunkStart, setChunkStart] = useState<number>(Date.now());
  const [lastEvent, setLastEvent] = useState<React.WheelEvent>(null);

  useEffect(() => {
    if (chunkStart + timer < Date.now() && lastEvent != null) {
      onWheel(dist, lastEvent);
      setChunkStart(Date.now());
      setDist(0);
      setLastEvent(null);
    }
  }, [dist]);

  return (e: React.WheelEvent): void => {
    e.persist();

    setLastEvent(e);
    setDist(dist + e.deltaY);
  };
};
