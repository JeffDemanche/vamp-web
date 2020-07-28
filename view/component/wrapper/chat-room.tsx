import * as React from "react";
import * as io from "socket.io-client";
import * as Peer from "simple-peer";
import { useEffect, useState, useRef } from "react";
import { vampAudioContext } from "../../audio/vamp-audio-context";
import { vampAudioStream } from "../../audio/vamp-audio-stream";

import * as styles from "./chat-room.less";
import { Row } from "react-bootstrap";

// Reference: https://www.youtube.com/watch?v=R1sfHPwEH7A

const audioContext = vampAudioContext.getAudioContext();

// Wrapper for the peer's audio stream
interface PeerStreamProps {
  peer: Peer.Instance;
}

const PeerStream: React.FC<PeerStreamProps> = (props: PeerStreamProps) => {
  const ref = useRef(null);
  useEffect(() => {
    // Add the stream from other user's in the user's
    props.peer.on("stream", (stream: MediaStream) => {
      ref.current.srcObject = stream;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioContext.destination);
    });
  }, []);

  // TODO
  return (
    <div className={styles["peer"]}>
      <audio ref={ref} muted={true} />
      <img src={require("../../img/vector/profile-placeholder.svg")}></img>
    </div>
  );
};

// Wrapper component for handling chatroom with other users
interface ChatRoomProps {
  vampId: string;
  children: React.ReactNode;
}

export const ChatRoom: React.FC<ChatRoomProps> = (
  props: ChatRoomProps
): JSX.Element => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef(null);
  const userAudio = useRef(null);
  const peersRef = useRef([]);
  const roomId = props.vampId;

  const createPeer = (
    userToSignal: any,
    callerID: any,
    stream: MediaStream
  ): Peer.Instance => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    // Initiate the handshake
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
    callerID: any,
    stream: MediaStream
  ): Peer.Instance => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    // Shake hands back
    peer.on("signal", signal => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  useEffect(() => {
    socketRef.current = io.connect("/");
    const userAudioStream = vampAudioStream.getAudioStream();
    userAudio.current.srcObject = userAudioStream;
    socketRef.current.emit("join room", roomId);

    // Notify all users of every other user -- "full-mesh network"
    socketRef.current.on("all users", (users: any[]) => {
      const peers: Peer.Instance[] = [];
      users.forEach(userID => {
        const peer = createPeer(userID, socketRef.current.id, userAudioStream);
        peersRef.current.push({
          peerID: userID,
          peer
        });
        peers.push(peer);
      });
      setPeers(peers);
    });

    // New browser on this vamp
    socketRef.current.on("user joined", (payload: any) => {
      const item = peersRef.current.find(p => p.peerID === payload.callerID);
      if (!item) {
        const peer = addPeer(payload.signal, payload.callerID, userAudioStream);
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

  // TODO: what should it visually look like? very silly looking rn
  return (
    <div className={styles["chat-room"]}>
      <Row>
        <div className={styles["user"]}>
          <img src={require("../../img/vector/profile-placeholder.svg")}></img>
          <audio ref={userAudio} muted={true} />
        </div>
        {peers.map((peer, index) => {
          return <PeerStream key={index} peer={peer} />;
        })}
      </Row>

      {props.children}
    </div>
  );
};
