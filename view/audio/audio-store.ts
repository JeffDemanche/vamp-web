import { ApolloClient, gql } from "apollo-boost";
import { ClientClip } from "../state/cache";

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
    clip: ClientClip,
    blob: Blob,
    apolloClient: ApolloClient<object>,
    audioContext: AudioContext
  ): Promise<void> {
    if (!clip.storedLocally) {
      const arrBuf = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrBuf);
      const duration = audioBuffer.duration;

      const currentClientClips = apolloClient.readQuery({
        query: gql`
          query GetClientClips {
            clientClips @client {
              id @client
              start @client
              tempFilename @client
              duration @client
            }
          }
        `
      });
      const newClips = [...currentClientClips.clientClips];
      newClips.forEach((c, index) => {
        if (c.id === clip.id) {
          newClips[index].duration = duration;
          newClips[index].storedLocally = true;
        }
      });

      apolloClient.writeData({
        data: { clientClips: newClips }
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
    apolloClient: ApolloClient<object>,
    audioContext: AudioContext
  ): Promise<void> {
    if (!clip.audio.storedLocally) {
      const res = await fetch(`/audio/${clip.audio.id}.webm`);
      const blob = await res.blob();
      const arrBuf = await blob.arrayBuffer();

      const audioBuffer = await audioContext.decodeAudioData(arrBuf);

      const currentClips = apolloClient.readQuery({
        query: gql`
          query GetClips {
            clips @client {
              id @client
              audio @client {
                id @client
                filename @client
                storedLocally @client
                duration @client
              }
            }
          }
        `
      });

      const newClips = [...currentClips.clips];
      newClips.forEach((c, index) => {
        if (c.id === clip.id) {
          newClips[index].audio.storedLocally = true;
          newClips[index].audio.duration = audioBuffer.duration;
        }
      });

      apolloClient.writeData({
        data: { clips: newClips }
      });
      this._store[clip.audio.id] = { data: blob };
    }
  }
}

export default AudioStore;
