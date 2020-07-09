import { ApolloClient } from "apollo-boost";

import {
  GET_CLIPS_CLIENT,
  GET_CLIENT_CLIPS_CLIENT
} from "../state/queries/clips-queries";
import { GetClipsClient, GetClientClipsClient } from "../state/apollotypes";

interface StoredAudio {
  data: Blob;
}

/**
 * Downloaded audio needs to be stored in memory somehwere. There doesn't seem
 * to be much support for doing that in Apollo or Redux, so we're doing it in
 * this class, which is essentially a dictionary for audio data.
 */
class AudioStore {
  private _store: { [audioId: string]: StoredAudio };

  constructor() {
    this._store = {};
  }

  getStoredAudio = (audioId: string): StoredAudio => this._store[audioId];

  /**
   * Adds a ClientClip to the cache. Since this is a different type than the
   * Clip type which gets retrieved from the server, it's slightly different
   * than cacheClipAudio. But it does essentially the same thing.
   */
  async cacheClientClipAudio(
    clip: { id: string; storedLocally: boolean; tempFilename: string },
    vampId: string,
    blob: Blob,
    apolloClient: ApolloClient<object>,
    audioContext: AudioContext
  ): Promise<void> {
    if (!clip.storedLocally) {
      const arrBuf = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrBuf);
      const duration = audioBuffer.duration;

      const currentClientClips: GetClientClipsClient = apolloClient.readQuery({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const newClips = [...currentClientClips.vamp.clientClips];
      newClips.forEach((c, index) => {
        if (c.id === clip.id) {
          newClips[index].duration = duration;
          newClips[index].storedLocally = true;
        }
      });

      apolloClient.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: newClips }
        }
      });

      this._store[clip.tempFilename] = { data: blob };
    }
  }

  /**
   * Handles downloading the audio for a Clip and stores it in the audio store.
   *
   * @param clip A subselection of the GQL Clip type (an entire clip object
   * could be passed).
   */
  async cacheClipAudio(
    clip: {
      id: string;
      audio: {
        id: string;
        filename: string;
        storedLocally: boolean;
      };
    },
    vampId: string,
    apolloClient: ApolloClient<object>,
    audioContext: AudioContext
  ): Promise<void> {
    if (!clip.audio.storedLocally) {
      const res = await fetch(`/audio/${clip.audio.id}.webm`);
      const blob = await res.blob();
      const arrBuf = await blob.arrayBuffer();

      const audioBuffer = await audioContext.decodeAudioData(arrBuf);

      const currentClips: GetClipsClient = apolloClient.readQuery({
        query: GET_CLIPS_CLIENT,
        variables: { vampId }
      });

      const newClips = [...currentClips.vamp.clips];
      newClips.forEach((c, index) => {
        if (c.id === clip.id) {
          newClips[index].audio.storedLocally = true;
          newClips[index].audio.duration = audioBuffer.duration;
        }
      });

      apolloClient.writeData({
        data: { vamp: { __typename: "Vamp", id: vampId, clips: newClips } }
      });
      this._store[clip.audio.id] = { data: blob };
    }
  }
}

// this is throwing a default export error, but this how we make audio store resuseable
// eslint-disable-next-line prefer-const
export let audioStore = new AudioStore();
