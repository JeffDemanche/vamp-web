# README - WebRTC stuff

## Purpose

    Real time collaboration is a necessary feature for Vamp.  Ideally, we'd like two or more clients to communicate directly to one another without the use of a server in cases where we want to reduce latency.  For example, if Dan and Jeff are recording, and Dan catches up to the timestamp at which Jeff started recording, Jeff's recording starts playing from the beginning on Dan's browser while Dan records.  Luckily the WebRTC API makes direct communication between clients possible.

## Signaling

    Before any direct communication is possible however, we need a "signaling" server in order to establish the connection between any two peers.  Currently, we're using two publicly available STUN servers to be this intermediary.  However, we might need to use a TURN server for certain cases (reference: https://webrtc.org/getting-started/turn-server).  After sharing certain information with this server and doing what is called a "handshake", different clients can directly communicate with each other without a server.  We implemented the connection to the server using websockets with a library called socket.io which simplifies many things. This signaling code is written in `vamp-server/server.ts`, and is worth pulling up side by side with the client-side code to understand where events are emitted and recieved.  In order to allow direct communication between multiple peers in a vamp, we implemented what is called a "full-mesh" network topology, which is very simple to implement, but not very scalable (a later problem).  Basically, for any combination of two peers on a vamp, we establish the connection through the signaling server.  That is, when a new user enters the vamp, all the current users connect with him/her through the event `allUsers` on the backend code.

## Current State of Things

    As of 8/25/2020 -

    All the signaling code is implemented in the react hook, `usePeers`.  This hook returns an array of peers to which we can attach data, streams, etc.  It's first used in component `./peer-audio-wrapper.tsx`, which wraps around a vamp workspace.  That is, when a client enters the vamp, the peer logic starts.
    When a client starts recording, we spawn a MediaRecorder.  As buffer data becomes available from the MediaRecorder, we broadcast that audio data to the other peers in the vamp.  This behavior has some bugs which are outlined below, but the logic should definately change:  Instead of spawning a MediaRecorder every time a user records, we should stream their recording directly to the audio store (similar to how that media recorder works in the PeerAudioWrapper) and request that data from the audio store in PeerAudioWrapper to send to the peers.  After that, the receiving client would start pushing that data to his/her audio store so it's immediately available.

## Known Bugs

    As of 8/25/2020 -

    In Chrome, I get `WebSocket connection to 'ws://localhost:4567/socket.io/?EIO=3&transport=websocket&sid=XPbNoSAWceyzmPiNAAAI' failed: Invalid frame header` as soon as the user enters a vamp.  Similarly in FireFox, I get `The connection to ws://localhost:4567/socket.io/?EIO=3&transport=websocket&sid=_10uHK7u_n5XqkUbAAAJ was interrupted while the page was loading.`  I tried the Stack Overflow solutions with no luck.  Fortunately, I don't think these bugs are affecting the behavior because the connection between peers in a vamp is still established.

    In Chrome, a client successfully sends the audio data to his/her peers in the vamp.  However, there's a weird bug where subsequent recording data is duplicated 7, 8, 9 times over on the receiver end.  My guess is that this has something to do with the way we're using the MediaRecorder, which needs to change anyway.

    In Firefox, a client only sends a little bit of data over before the channel closes (my suspicion) for some reason.  I experimented with different speeds for sending the data in case the browser couldn't handle the amount of streamed data, but that did nothing.  I did get a webRTC error prompting me to use a TURN server, but I doubt that's the problem here because I visited Firefox on the same computer.  Something to note is that a Chrome client successfully sends the data to the Firefox peer, but the Firefox client still has the same problem: sends a little bit of data to his/her peer but the data channel closes.

    There's also a whole new category of problems when a client leaves the vamp.  Currently, if the client tries to send data to a peer, but it doesn't work, he emits an error which results in that peer being destroyed.  This is pretty much how error handling should work with WebRTC, but also happens when a peer just leaves.  We should figure out how a client could gracefully leave a vamp.
