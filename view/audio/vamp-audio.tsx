/**
 * This file is sort of the root of all actual audio playback capabilities.
 * WorkspaceAudio is a component, meaning it can recieve state updates straight
 * from Apollo and reflect those updates in the audio playback (much like how a
 * visual component reflects updates in how it renders). For instance, if the
 * state of "playing" changes, WorkspaceAudio can listen for that and play or
 * pause the audio accordingly.
 */

import { SchedulerInstance } from "./scheduler";
import * as React from "react";
import { useEffect, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { useCurrentUserId } from "../util/react-hooks";
import { audioStore } from "./audio-store";
import { vampAudioContext } from "./vamp-audio-context";
import { ClipPlayer } from "./clip-player";
import Looper from "./looper";
import { WorkspaceAudioClient } from "../state/apollotypes";
import { useSetLoop } from "../state/vamp-state-hooks";
import { FloorAdapter } from "./floor/floor-adapter";
import { CountOffAdapter } from "./count-off-adapter";
import { SeekAdapter } from "./adapter/seek-adapter";
import { PlayStopAdapter } from "./adapter/play-stop-adapter";
import { RecordAdapter } from "./adapter/record-adapter";

const WORKSPACE_AUDIO_CLIENT = gql`
  query WorkspaceAudioClient($vampId: ID!, $userId: ID!) {
    vamp(id: $vampId) @client {
      id

      bpm
      beatsPerBar
      playing
      metronomeSound
      playStartTime

      start
      end
      loop

      clips {
        id
        start
        duration
        content {
          id
          type
          start
          duration
          audio {
            id
            filename
            localFilename
            latencyCompensation
            storedLocally
            duration
          }
        }
      }

      clientClips {
        start
        audioStoreKey
        realClipId
        inProgress
        duration
        latencyCompensation
      }

      sections {
        id
        name
        bpm
        beatsPerBar
        metronomeSound
        startMeasure
        repetitions
        subSections {
          id
        }
      }

      forms {
        preSection {
          id
        }
        insertedSections {
          id
        }
        postSection {
          id
        }
      }
    }
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      cab {
        start
        duration
        loops
      }
    }
  }
`;

interface WorkspaceAudioProps {
  vampId: string;
}

const WorkspaceAudio = ({ vampId }: WorkspaceAudioProps): JSX.Element => {
  const startAudioContext = (): AudioContext => {
    try {
      return vampAudioContext.getAudioContext();
    } catch (e) {
      // TODO error handling.
      alert("Web audio not supported in this browser (TODO)");
    }
  };

  const userId = useCurrentUserId();

  // State query for clientside Vamp playback info.
  const {
    data: {
      vamp: { playing, clips, clientClips, playStartTime, sections, forms },
      userInVamp: {
        cab: { start: cabStart, duration: cabDuration, loops: cabLoops }
      }
    }
  } = useQuery<WorkspaceAudioClient>(WORKSPACE_AUDIO_CLIENT, {
    variables: { vampId, userId }
  });

  const setLoop = useSetLoop();

  const apolloClient = useApolloClient();
  const [context] = useState(startAudioContext());
  const [scheduler] = useState(SchedulerInstance);
  const [store] = useState(audioStore);

  // Passes the audio context into the scheduler instance.
  useEffect(() => {
    scheduler.giveContext(context);
  }, [context, scheduler]);

  /**
   * Called on every clips update (see the useEffect hook). After the audio for
   * all clips is downloaded, its duration is set in the local cache, so we wait
   * until then to set the start and end times for the Vamp timeline.
   */
  const updateStartEnd = (
    clips: {
      start: number;
      duration: number;
      content: {
        start: number;
        duration: number;
      }[];
    }[]
  ): void => {
    let start = 0;
    clips.forEach(clip => {
      if (clip.start < start) {
        start = clip.start;
      }
    });
    let end = start;
    clips.forEach(clip => {
      clip.content.forEach(content => {
        if (clip.start + content.start + content.duration > end) {
          end = clip.start + content.start + content.duration;
        }
      });
    });
    apolloClient.cache.modify({
      id: apolloClient.cache.identify({ __typename: "Vamp", id: vampId }),
      fields: {
        start(): number {
          return start;
        },
        end(): number {
          return end;
        }
      }
    });
  };

  /**
   * FORM DATA
   *
   * Handles changes to form.
   */
  useEffect(() => {
    const vampFormData = { sections, forms };
    scheduler.updateMetronome(vampFormData, playStartTime);
  }, [sections, forms, scheduler]);

  /**
   * CLIPS DATA
   *
   * Handles changes to clips (and client clips).
   */
  useEffect(() => {
    const empty =
      (clips === undefined || clips.length == 0) &&
      (clientClips === undefined || clientClips.length == 0);
    setLoop(!empty);

    // Process clips' audio and do stuff that requires access to the metadata
    // from the audio.
    if (clips) {
      for (const clip of clips) {
        // This function checks if the clip has already been cached.
        store.cacheClipAudio(clip, vampId, apolloClient, context);
      }
      updateStartEnd(clips);
    }
  }, [clips, clientClips]);

  return (
    <>
      <ClipPlayer
        clips={clips}
        clientClips={clientClips}
        audioStore={store}
        scheduler={scheduler}
      ></ClipPlayer>
      <Looper
        start={cabStart}
        end={cabDuration + cabStart}
        loops={cabLoops}
        playing={playing}
      ></Looper>
      <RecordAdapter scheduler={scheduler} context={context}></RecordAdapter>
      <PlayStopAdapter scheduler={scheduler}></PlayStopAdapter>
      <CountOffAdapter scheduler={scheduler}></CountOffAdapter>
      <SeekAdapter scheduler={scheduler}></SeekAdapter>

      <FloorAdapter></FloorAdapter>
    </>
  );
};

export { WorkspaceAudio };
