/*
 * A place for custom React hooks.
 */
import * as React from "react";
import { useQuery } from "react-apollo";
import { gql } from "apollo-boost";
import { useState, useEffect, useRef } from "react";
import { LOCAL_VAMP_ID_CLIENT } from "./state/queries/vamp-queries";
import { TrueTimeClient } from "./state/apollotypes";
import { audioStore } from "./audio/audio-store";
import * as io from "socket.io-client";
import * as Peer from "simple-peer";
import { vampAudioContext } from "./audio/vamp-audio-context";
import { vampAudioStream } from "./audio/vamp-audio-stream";
// import { vampVideoStream } from "./video/vamp-video-stream";

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
export const useStoredAudio = (id: string): number[] => {
  const [audioData, setAudioData] = useState([]);
  const fileBuffer = audioStore.getStoredAudio(id);

  // Use stored audio
  useEffect(() => {
    if (fileBuffer) {
      fileBuffer.data.arrayBuffer().then(arrayBuffer => {
        const audioBuffer = vampAudioContext
          .getAudioContext()
          .decodeAudioData(arrayBuffer);
        audioBuffer.then(audioBuffer => {
          setAudioData(Array.from(audioBuffer.getChannelData(0)));
        });
      });
    }
  }, [fileBuffer]);

  return audioData;
};

// If there's no stored audio, we use the user's mic stream and animate
export const useStreamedAudio = (): number[] => {
  const context = vampAudioContext.getAudioContext();
  let stream: MediaStream;
  let _data: Float32Array;
  let source: MediaStreamAudioSourceNode;
  let analyser: AnalyserNode;
  vampAudioStream
    .getAudioStream()
    .then(res => (stream = res))
    .then(() => {
      source = context.createMediaStreamSource(stream);
      analyser = context.createAnalyser();
      source.connect(analyser);
    });

  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const audioDataRef = useRef([]);

  const update = (time: number): void => {
    const audioData = audioDataRef.current;
    if (previousTimeRef.current != undefined) {
      _data = new Float32Array(analyser.fftSize);
      // Copy new values into the blank data array
      analyser.getFloatTimeDomainData(_data);
      audioDataRef.current = audioData.concat(Array.from(_data));
    }
    // To slow animation down, browser can't handle faster fr (as of now)
    const rate = 100;
    setTimeout(() => {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(update);
    }, rate);
  };

  useEffect(() => {
    if (stream) {
      requestRef.current = requestAnimationFrame(update);
      return (): void => cancelAnimationFrame(requestRef.current);
    }
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
      vampAudioStream.getAudioStream().then(res => (stream = res));
      break;
    }
    // case "video": {
    //   stream = vampVideoStream.getVideoStream();
    //   break;
    // }
    default:
      vampAudioStream.getAudioStream().then(res => (stream = res));
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
