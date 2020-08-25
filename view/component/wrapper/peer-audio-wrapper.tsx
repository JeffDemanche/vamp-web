import * as React from "react";
import {
  usePeers,
  useCurrentVampId,
  useCurrentUserId
} from "../../react-hooks";
import { useEffect, useRef } from "react";
import { vampAudioStream } from "../../audio/vamp-audio-stream";
import {
  RecordingClient,
  PlayPositionStartTimeClient
} from "../../state/apollotypes";
import { useQuery } from "react-apollo";
import { RECORDING_CLIENT } from "../../state/queries/vamp-queries";
// eslint-disable-next-line max-len
import { PLAY_POSITION_START_TIME_CLIENT } from "../../state/queries/vamp-queries";

interface PeerAudioProps {
  children: React.ReactNode;
}

export const PeerAudioWrapper: React.FunctionComponent<PeerAudioProps> = (
  props: PeerAudioProps
) => {
  const vampId = useCurrentVampId();
  const peers = usePeers(); // Signaling is done here
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });
  const mediaRecorderRef = useRef<MediaRecorder>(null);
  const currentUserId = useCurrentUserId();
  const { data: playPositionData } = useQuery<PlayPositionStartTimeClient>(
    PLAY_POSITION_START_TIME_CLIENT,
    {
      variables: { vampId }
    }
  );

  /*
    Peers as senders perspective
  */
  useEffect(() => {
    if (recordingData.vamp.recording && peers) {
      /*
        NOTE: Right now, we create a media recorder per recording session, but once we
        implement streaming directly to the audio store, we'd wanna pull data 
        directly from there and send it
      */
      vampAudioStream
        .getAudioStream()
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream, {
            audioBitsPerSecond: 128000,
            mimeType: "audio/webm"
          });

          // Tell all the peers who's recording and at what time they started with this object
          peers.map(peer => {
            if (!peer.destroyed) {
              try {
                // A peer could disconnect at any time, so we don't send if their connection is down
                peer.send(
                  JSON.stringify({
                    userId: currentUserId,
                    startTime: playPositionData.vamp.playStartTime
                  })
                );
              } catch (err) {
                peer.emit("error", err);
              }
            }
          });
          // Send audio as buffers as its available from media recorder
          mediaRecorderRef.current.ondataavailable = (e: BlobEvent): void => {
            e.data.arrayBuffer().then(buffer => {
              peers.map(peer => {
                if (!peer.destroyed) {
                  try {
                    peer.send(buffer);
                  } catch (err) {
                    peer.emit("error", err);
                  }
                }
              });
            });
          };
          const timeSlice = 30;
          mediaRecorderRef.current.start(timeSlice);
        })
        .catch(() => {
          console.log("mic access not given");
        });
    } else if (mediaRecorderRef.current) {
      // When the recording data changes to not recording, but the media recorder is still on
      if (mediaRecorderRef.current.state == "recording") {
        mediaRecorderRef.current.stop();
      }
    }
  }, [recordingData.vamp.recording]);

  /*
    Peers as receivers perspective 
  */
  useEffect(() => {
    peers.map(peer =>
      peer.on("data", data => {
        // TODO: Cache the data in the audio store
        console.log(data.length);
      })
    );
  });

  return <React.Fragment>{props.children}</React.Fragment>;
};
