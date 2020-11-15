import { ApolloClient } from "@apollo/client";

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
   * Appends a chunk of audio data onto a store entry by key. If the key doesn't
   * exist, a new entry is created with only the provided blob data.
   */
  appendBlob = (storeKey: string, blob: Blob): Blob => {
    if (this._store[storeKey]) {
      const existingBlob = this._store[storeKey].data;
      this._store[storeKey].data = new Blob([existingBlob, blob], {
        type: existingBlob.type
      });
    } else {
      this._store[storeKey] = { data: blob };
    }
    return this._store[storeKey].data;
  };

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

      const cache = apolloClient.cache;
      cache.modify({
        id: cache.identify({ __typename: "Audio", id: clip.audio.id }),
        fields: {
          storedLocally: (): boolean => {
            return true;
          },
          duration: (): number => audioBuffer.duration
        }
      });

      this._store[clip.audio.id] = { data: blob };
    }
  }
}

// eslint-disable-next-line prefer-const
export let audioStore = new AudioStore();
