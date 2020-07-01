import { ClientClip } from "../state/cache";
import { useEffect } from "react";
import AudioStore from "./audio-store";
import { Scheduler } from "./scheduler";

interface ClipPlayerProps {
  clips: {
    id: string;
    start: number;
    audio: {
      id: string;
      storedLocally: boolean;
    };
  }[];
  clientClips: {
    id: string;
    storedLocally: boolean;
    start: number;
    tempFilename: string;
  }[];
  audioStore: AudioStore;
  scheduler: Scheduler;
}

/**
 * This is a component that's used in the WorkspaceAudio component. This is
 * responsible for tracking clips in the Apollo cache and managing their
 * scheduled audio events.
 */
const ClipPlayer = ({
  clips,
  clientClips,
  audioStore,
  scheduler
}: ClipPlayerProps): JSX.Element => {
  // This call creates audio scheduler events for clips that have been retrieved
  // from the server via query or subscription.
  useEffect(() => {
    // Called when new clips arrive.
    scheduler.removeAllClipEvents();
    clips.forEach(clip => {
      if (clip.audio.storedLocally)
        scheduler.addEvent({
          id: clip.id,
          start: clip.start,
          clip: true,
          dispatch: async (
            context: AudioContext,
            offset: number
          ): Promise<AudioScheduledSourceNode> => {
            const fileBuffer = await audioStore
              .getStoredAudio(clip.audio.id)
              .data.arrayBuffer();
            const source = context.createBufferSource();

            const decodedData = await context.decodeAudioData(fileBuffer);

            source.buffer = decodedData;
            source.connect(context.destination);
            console.timeEnd("removed clip");
            source.start(0, offset);

            return source;
          }
        });
    });
  }, [clips]);

  // This call creates scheduler events for clips that exist only client-side
  // ("ClientClips"). We use these so we can loop immediately without waiting to
  // hear back from the server with the proper clip response.
  useEffect(() => {
    clientClips.forEach(clientClip => {
      if (clientClip.storedLocally) {
        scheduler.addEvent({
          id: clientClip.id,
          start: clientClip.start,
          clip: true,
          dispatch: async (
            context: AudioContext,
            offset: number
          ): Promise<AudioScheduledSourceNode> => {
            const fileBuffer = await audioStore
              .getStoredAudio(clientClip.tempFilename)
              .data.arrayBuffer();
            const source = context.createBufferSource();

            const decodedData = await context.decodeAudioData(fileBuffer);

            source.buffer = decodedData;
            source.connect(context.destination);
            source.start(0, offset);

            return source;
          }
        });
      }
    });
  }, [clientClips]);

  return null;
};

export default ClipPlayer;
